/**
 * Placeholder pricing for the Get-a-Price quote journey.
 * Swap for admin pricing_rules later without changing UI.
 */
import type { HomeCategory, QuoteDraft, QuoteTotals } from "@/lib/quote/types";
import { computeDepositCents } from "@/lib/payments";

export const DELIVERY_CENTS = 2500;
export const PICKUP_CENTS = 2500;
export const DEFAULT_ASSEMBLY_CENTS = 4900;

export const HOME_CATEGORY_CENTS: Record<HomeCategory, number> = {
  bed: 6900,
  dresser: 5900,
  table: 4500,
  shelf: 3900,
  chair: 3500,
  other: 4900,
};

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function computeQuoteTotals(draft: QuoteDraft): QuoteTotals {
  const itemCount = draft.items.length;
  const assemblyCents = draft.items.reduce(
    (sum, item) => sum + item.assemblyCents * (item.quantity ?? 1),
    0
  );
  const pickupCents = draft.pickupMode === "pickup" ? PICKUP_CENTS : 0;
  const deliveryCents = itemCount > 0 ? DELIVERY_CENTS : 0;
  const subtotalCents = assemblyCents + pickupCents + deliveryCents;
  const depositCents =
    subtotalCents > 0 ? computeDepositCents(subtotalCents) : 0;
  const balanceCents = Math.max(0, subtotalCents - depositCents);

  return {
    assemblyCents,
    pickupCents,
    deliveryCents,
    subtotalCents,
    depositCents,
    balanceCents,
    itemCount,
  };
}
