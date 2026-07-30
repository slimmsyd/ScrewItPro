/**
 * Idempotent booking confirmation send.
 * Never throws — booking API must not fail because of email.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnvStatus, publicEnv } from "@/lib/env";
import { dispatchEmail } from "./dispatch";
import { renderBookingConfirmation } from "./render-booking-confirmation";
import { formatCents } from "@/lib/orders/format";
import type { BookingConfirmationData } from "./templates";

const CODE = "booking-confirmation" as const;

export type SendBookingConfirmationInput = {
  to: string;
  orderId: string;
  orderNumber: string;
  customerName?: string | null;
  deliveryLine?: string | null;
  itemSummary?: string | null;
  depositCents?: number | null;
  paymentNote?: string | null;
};

async function hasSuccessfulSend(
  orderId: string
): Promise<boolean> {
  const status = getEnvStatus();
  if (!status.supabase.configured || !status.supabase.serviceRoleConfigured) {
    return false;
  }
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("email_log")
      .select("id")
      .eq("template_code", CODE)
      .eq("order_id", orderId)
      .eq("status", "sent")
      .limit(1)
      .maybeSingle();
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Send (or outbox) booking-confirmation for an order.
 * Safe to call after soft-gate book; later after Stripe deposit.
 */
export async function sendBookingConfirmationEmail(
  input: SendBookingConfirmationInput
): Promise<{ attempted: boolean; skippedReason?: string }> {
  try {
    const to = input.to?.trim();
    if (!to) {
      console.info("[email:booking] skip — no recipient");
      return { attempted: false, skippedReason: "no_recipient" };
    }

    if (await hasSuccessfulSend(input.orderId)) {
      console.info(
        `[email:booking] skip — already sent for order ${input.orderId}`
      );
      return { attempted: false, skippedReason: "already_sent" };
    }

    const appUrl = (publicEnv.appUrl || "https://screwitpros.com").replace(
      /\/$/,
      ""
    );
    const orderNumber = input.orderNumber;
    const data: BookingConfirmationData = {
      customerName: input.customerName,
      orderNumber,
      trackUrl: `${appUrl}/customer/orders/${encodeURIComponent(orderNumber)}/track`,
      jobsUrl: `${appUrl}/customer/jobs`,
      deliveryLine: input.deliveryLine,
      itemSummary: input.itemSummary,
      depositFormatted:
        input.depositCents != null && input.depositCents >= 0
          ? formatCents(input.depositCents)
          : null,
      paymentNote: input.paymentNote,
    };

    const rendered = await renderBookingConfirmation(data);
    await dispatchEmail(to, rendered, {
      orderId: input.orderId,
      payload: {
        orderNumber,
        source: "sendBookingConfirmationEmail",
      },
    });

    return { attempted: true };
  } catch (e) {
    console.error(
      "[email:booking] failed (non-fatal)",
      e instanceof Error ? e.message : e
    );
    return { attempted: false, skippedReason: "error" };
  }
}
