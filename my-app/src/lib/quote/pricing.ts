/**
 * Placeholder pricing for the Get-a-Price quote journey.
 * Swap for admin pricing_rules later without changing UI.
 *
 * Travel (Model 1): free inside hub radius; farFee outside.
 * Deposit % applies to subtotal including travel (Stripe-ready).
 */
import type { HomeCategory, QuoteDraft, QuoteTotals } from "@/lib/quote/types";
import { computeDepositCents } from "@/lib/payments";
import { haversineM } from "@/lib/config/service-area";
import {
  evaluateTravelPricing,
  metersToMiles,
  type TravelPricingResult,
} from "@/lib/quote/travel-pricing";

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

/** Hub + farFee needed to price travel on the client (from public service-area). */
export type TravelRateCard = {
  lat: number;
  lng: number;
  radiusMiles: number;
  farFee: number;
};

export function travelFromDelivery(
  draft: QuoteDraft,
  rates: TravelRateCard | null | undefined
): TravelPricingResult | null {
  const place = draft.deliveryAddress;
  if (!place || !rates) return null;
  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return null;

  const meters = haversineM(
    { lat: rates.lat, lng: rates.lng },
    { lat: place.lat, lng: place.lng }
  );
  const miles = metersToMiles(meters);
  return evaluateTravelPricing({
    miles,
    radiusMiles: rates.radiusMiles,
    farFee: rates.farFee,
    zip: place.zip,
  });
}

export function computeQuoteTotals(
  draft: QuoteDraft,
  rates?: TravelRateCard | null
): QuoteTotals {
  const itemCount = draft.items.length;
  const assemblyCents = draft.items.reduce(
    (sum, item) => sum + item.assemblyCents * (item.quantity ?? 1),
    0
  );
  const pickupCents = draft.pickupMode === "pickup" ? PICKUP_CENTS : 0;
  const deliveryCents = itemCount > 0 ? DELIVERY_CENTS : 0;

  const travel = travelFromDelivery(draft, rates);
  const travelCents =
    travel && travel.allowed ? travel.feeCents : 0;
  const travelLabel = travel?.label ?? "No travel fee";
  const beyondRadius = travel?.beyondRadius ?? false;
  const travelMiles = travel?.miles ?? 0;

  const subtotalCents =
    assemblyCents + pickupCents + deliveryCents + travelCents;
  const depositCents =
    subtotalCents > 0 ? computeDepositCents(subtotalCents) : 0;
  const balanceCents = Math.max(0, subtotalCents - depositCents);

  return {
    assemblyCents,
    pickupCents,
    deliveryCents,
    travelCents,
    travelLabel,
    beyondRadius,
    travelMiles,
    subtotalCents,
    depositCents,
    balanceCents,
    itemCount,
  };
}
