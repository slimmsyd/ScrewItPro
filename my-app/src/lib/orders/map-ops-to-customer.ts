/**
 * Map DB lifecycle_status → customer portal 7-state UI.
 * Frozen in vault/architecture.md Phase C (C0).
 */
import type { CustomerOrderStatus } from "./types";

/** Mirrors public.order_lifecycle_status */
export type OrderLifecycleStatus =
  | "draft"
  | "pending_quote"
  | "quote_sent"
  | "awaiting_arrival"
  | "boxes_received"
  | "in_assembly"
  | "assembly_completed"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "delivered"
  | "on_hold_damage_reported"
  | "refused_pending_resolution"
  | "refunded_closed"
  | "cancelled_no_payment";

/** Mirrors public.payment_status */
export type PaymentStatus =
  | "unpaid"
  | "deposit_paid"
  | "paid_in_full"
  | "balance_failed"
  | "partially_refunded"
  | "refunded";

/**
 * Customer-facing status for My Jobs / tracker.
 * Returns null for pre-book / cancelled states that should not appear as active jobs.
 */
export function mapLifecycleToCustomer(
  lifecycle: OrderLifecycleStatus | string | null | undefined
): CustomerOrderStatus | null {
  switch (lifecycle) {
    case "awaiting_arrival":
      return "booked";
    case "boxes_received":
      return "picked_up";
    case "in_assembly":
      return "in_workshop";
    case "assembly_completed":
    case "ready_for_delivery":
      return "assembled_inspected";
    case "out_for_delivery":
      return "out_for_delivery";
    case "delivered":
      return "delivered";
    // Exceptions: temporary fallback until customer exception UI exists
    case "on_hold_damage_reported":
    case "refused_pending_resolution":
      return "in_workshop";
    case "draft":
    case "pending_quote":
    case "quote_sent":
    case "cancelled_no_payment":
    case "refunded_closed":
      return null;
    default:
      return null;
  }
}

/** True when the order should show on My Jobs "active" or "past" lists. */
export function isCustomerVisibleJob(
  lifecycle: OrderLifecycleStatus | string | null | undefined
): boolean {
  return mapLifecycleToCustomer(lifecycle) != null;
}
