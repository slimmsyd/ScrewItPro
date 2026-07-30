/**
 * Map Supabase order + order_items rows → portal MockOrder DTO.
 * Used by GET /api/customer/jobs and order detail (Phase C2).
 */
import type { MockOrder, MockOrderItem } from "./types";
import {
  mapLifecycleToCustomer,
  type OrderLifecycleStatus,
} from "./map-ops-to-customer";
import { nextStepForStatus } from "./portal-jobs";

/** Minimal DB shape for list/detail (Supabase select). */
export type DbOrderItemRow = {
  name: string;
  quantity: number | null;
  fulfillment_mode?: string | null;
  image_url?: string | null;
  retailer?: string | null;
  sort_order?: number | null;
};

export type DbOrderRow = {
  id: string;
  order_number?: string | null;
  customer_email?: string | null;
  contact_email?: string | null;
  lifecycle_status?: string | null;
  status?: string | null;
  total_cents?: number | null;
  deposit_cents?: number | null;
  balance_cents?: number | null;
  subtotal_cents?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  metadata?: Record<string, unknown> | null;
  order_items?: DbOrderItemRow[] | null;
};

function fulfillmentLabel(mode: string | null | undefined): string {
  switch (mode) {
    case "store_pickup":
      return "Store pickup";
    case "customer_dropoff":
      return "Drop-off";
    case "warehouse_assembly":
    default:
      return "Ship to hub";
  }
}

function formatBookedAtLabel(
  status: MockOrder["status"],
  createdAt: string | null | undefined
): string | undefined {
  if (!createdAt) return undefined;
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return undefined;
  const label = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return status === "delivered" ? `Delivered ${label}` : `Booked ${label}`;
}

function mapItems(rows: DbOrderItemRow[] | null | undefined): MockOrderItem[] {
  if (!rows?.length) return [];
  const sorted = [...rows].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  return sorted.map((row) => {
    const item: MockOrderItem = {
      name: row.name || "Your build",
      quantity: Math.max(1, row.quantity ?? 1),
      fulfillmentLabel: fulfillmentLabel(row.fulfillment_mode),
    };
    if (row.image_url) item.imageUrl = row.image_url;
    return item;
  });
}

/**
 * Convert a DB order row to portal DTO.
 * Returns null when lifecycle is not customer-visible (pre-book / cancelled).
 */
export function mapDbOrderToPortal(row: DbOrderRow): MockOrder | null {
  const lifecycle =
    (row.lifecycle_status as OrderLifecycleStatus | null | undefined) ?? null;
  const status = mapLifecycleToCustomer(lifecycle);
  if (!status) return null;

  const items = mapItems(row.order_items);
  const meta = row.metadata ?? {};
  const deliveryFromMeta =
    typeof meta.deliveryLine === "string" ? meta.deliveryLine : null;

  const depositCents = Math.max(0, row.deposit_cents ?? 0);
  const totalCents = Math.max(
    0,
    row.total_cents ?? row.subtotal_cents ?? depositCents
  );
  const balanceCents = Math.max(
    0,
    row.balance_cents ?? Math.max(0, totalCents - depositCents)
  );

  const first = items[0];
  const nextStep = nextStepForStatus(status);

  return {
    id: row.order_number?.trim() || row.id,
    email: row.contact_email || row.customer_email || "",
    status,
    statusUpdatedAt:
      row.updated_at || row.created_at || new Date().toISOString(),
    items:
      items.length > 0
        ? items
        : [
            {
              name: "Your build",
              quantity: 1,
              fulfillmentLabel: "Ship to hub",
            },
          ],
    depositCents,
    balanceCents,
    totalCents,
    deliveryLine: deliveryFromMeta?.trim() || "—",
    nextStep: { title: nextStep.title, body: nextStep.body },
    sourceLabel: first?.fulfillmentLabel ?? "Ship to hub",
    bookedAtLabel: formatBookedAtLabel(status, row.created_at),
    iconName: "Package",
  };
}

/** Map many rows; drop non-visible lifecycles. */
export function mapDbOrdersToPortal(rows: DbOrderRow[]): MockOrder[] {
  const out: MockOrder[] = [];
  for (const row of rows) {
    const job = mapDbOrderToPortal(row);
    if (job) out.push(job);
  }
  return out;
}
