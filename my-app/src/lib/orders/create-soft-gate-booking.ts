/**
 * Create a soft-gate demo booking: real order + items, lifecycle visible on My Jobs.
 * Server-only. Uses service role for inserts (customer has SELECT only).
 *
 * Stripe deposit webhook should later call a sibling helper to set
 * payment_status + lifecycle after real payment — not this function.
 */
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  priceDraftServerSide,
  type DeliveryGeoInput,
  type DraftLineInput,
} from "@/lib/quote/server-pricing";

export type SoftGateBookingInput = {
  user: User;
  items: DraftLineInput[];
  pickupMode?: "pickup" | "ship" | null;
  deliveryLine?: string;
  delivery?: DeliveryGeoInput | null;
};

export type SoftGateBookingResult = {
  orderId: string;
  orderNumber: string;
  depositCents: number;
  totalCents: number;
};

function fulfillmentModeForLine(
  line: DraftLineInput,
  pickupMode: "pickup" | "ship" | null | undefined
): "warehouse_assembly" | "hybrid" | "onsite_only" {
  if (line.src === "retailer" || pickupMode === "pickup") return "hybrid";
  return "warehouse_assembly";
}

/**
 * Insert order at awaiting_arrival (INSERT does not enforce transition edges).
 * payment stays unpaid — we do not claim Stripe deposit succeeded.
 */
export async function createSoftGateBooking(
  input: SoftGateBookingInput
): Promise<SoftGateBookingResult> {
  const priced = await priceDraftServerSide({
    items: input.items,
    pickupMode: input.pickupMode ?? null,
    delivery: input.delivery ?? null,
  });

  if (!priced.travelAllowed) {
    throw new SoftGateBookingError(
      "zip_refused",
      priced.travelLabel ||
        "We can’t serve that delivery ZIP. Choose another address."
    );
  }

  if (priced.subtotalCents <= 0 || input.items.length === 0) {
    throw new SoftGateBookingError(
      "empty_quote",
      "Add items before booking."
    );
  }

  const admin = createAdminClient();
  const email = input.user.email ?? null;

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      customer_id: input.user.id,
      customer_email: email,
      contact_email: email,
      status: "pending_payment",
      lifecycle_status: "awaiting_arrival",
      payment_status: "unpaid",
      total_cents: priced.subtotalCents,
      deposit_cents: priced.depositCents,
      subtotal_cents: priced.subtotalCents,
      balance_cents: priced.balanceCents,
      metadata: {
        source: "soft_gate_demo",
        demoBooking: true,
        pickupMode: input.pickupMode ?? null,
        deliveryLine: input.deliveryLine ?? null,
        lineCount: priced.lineCount,
        assemblyCents: priced.assemblyCents,
        travelCents: priced.travelCents,
        beyondRadius: priced.beyondRadius,
        travelMiles: priced.travelMiles,
      },
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    console.error("[createSoftGateBooking] order", orderErr?.message);
    throw new SoftGateBookingError(
      "order_create_failed",
      "Could not create booking."
    );
  }

  const orderId = order.id as string;
  const orderNumber =
    (order.order_number as string | null)?.trim() || orderId;

  const itemRows = input.items.map((line, index) => {
    const qty = Math.max(1, Math.min(99, Math.floor(line.quantity ?? 1)));
    return {
      order_id: orderId,
      name: line.name.slice(0, 300),
      quantity: qty,
      unit_price_cents: 0,
      assembly_cents: 0,
      fulfillment_mode: fulfillmentModeForLine(line, input.pickupMode),
      status: "awaiting" as const,
      sort_order: index,
      metadata: {
        src: line.src ?? null,
        category: line.category ?? null,
      },
    };
  });

  // Snapshot assembly into assembly_cents per line (server re-priced total already)
  const perLine =
    priced.lineCount > 0
      ? Math.floor(priced.assemblyCents / priced.lineCount)
      : 0;
  for (const row of itemRows) {
    row.assembly_cents = perLine * row.quantity;
  }

  const { error: itemsErr } = await admin.from("order_items").insert(itemRows);
  if (itemsErr) {
    console.error("[createSoftGateBooking] items", itemsErr.message);
    // Order exists; surface failure so client can retry carefully
    throw new SoftGateBookingError(
      "order_create_failed",
      "Could not save line items."
    );
  }

  return {
    orderId,
    orderNumber,
    depositCents: priced.depositCents,
    totalCents: priced.subtotalCents,
  };
}

export class SoftGateBookingError extends Error {
  constructor(
    public readonly code:
      | "empty_quote"
      | "order_create_failed"
      | "demo_booking_disabled"
      | "zip_refused",
    message: string
  ) {
    super(message);
    this.name = "SoftGateBookingError";
  }
}
