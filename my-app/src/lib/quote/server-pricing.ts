/**
 * Server-only rate card for draft orders / checkout.
 * Client may display the same numbers via pricing.ts — never trust client cents.
 *
 * Travel (Model 1): recomputed from delivery lat/lng/zip + hub/ops — anti-spoof.
 * ZIP exceptions from ops_rules are applied here.
 * Stripe deposit = 30% of subtotal including travelCents (when allowed).
 */
import {
  DEFAULT_ASSEMBLY_CENTS,
  DELIVERY_CENTS,
  HOME_CATEGORY_CENTS,
  PICKUP_CENTS,
} from "@/lib/quote/pricing";
import type { HomeCategory } from "@/lib/quote/types";
import { computeDepositCents } from "@/lib/payments";
import {
  getServiceAreaConfig,
  haversineM,
} from "@/lib/config/service-area";
import {
  evaluateTravelPricing,
  metersToMiles,
  type TravelBand,
} from "@/lib/quote/travel-pricing";

export type DraftLineInput = {
  name: string;
  quantity?: number;
  src?: string;
  category?: string;
  /** Client-submitted assembly — ignored for pricing; re-derived server-side */
  assemblyCents?: number;
};

export type DeliveryGeoInput = {
  lat?: number | null;
  lng?: number | null;
  zip?: string | null;
};

const HOME_KEYS = new Set(Object.keys(HOME_CATEGORY_CENTS));

function assemblyForLine(line: DraftLineInput): number {
  if (line.src === "home" && line.category && HOME_KEYS.has(line.category)) {
    return HOME_CATEGORY_CENTS[line.category as HomeCategory];
  }
  if (line.src === "retailer") {
    return DEFAULT_ASSEMBLY_CENTS;
  }
  return DEFAULT_ASSEMBLY_CENTS;
}

export type ServerPricedDraft = {
  assemblyCents: number;
  pickupCents: number;
  deliveryCents: number;
  travelCents: number;
  travelLabel: string;
  beyondRadius: boolean;
  travelMiles: number;
  /** False when ZIP refuse — caller must not create a payable order. */
  travelAllowed: boolean;
  travelBand: TravelBand | null;
  subtotalCents: number;
  depositCents: number;
  balanceCents: number;
  lineCount: number;
};

/**
 * Server price for quote draft / soft-gate / Stripe order rows.
 * Never trust client totalCents or travelCents.
 */
export async function priceDraftServerSide(input: {
  items: DraftLineInput[];
  pickupMode?: "pickup" | "ship" | null;
  delivery?: DeliveryGeoInput | null;
}): Promise<ServerPricedDraft> {
  const items = input.items ?? [];
  const assemblyCents = items.reduce((sum, line) => {
    const qty = Math.max(1, Math.min(99, Math.floor(line.quantity ?? 1)));
    return sum + assemblyForLine(line) * qty;
  }, 0);
  const pickupCents = input.pickupMode === "pickup" ? PICKUP_CENTS : 0;
  const deliveryCents = items.length > 0 ? DELIVERY_CENTS : 0;

  let travelCents = 0;
  let travelLabel = "No travel fee";
  let beyondRadius = false;
  let travelMiles = 0;
  let travelAllowed = true;
  let travelBand: TravelBand | null = null;

  const lat = input.delivery?.lat;
  const lng = input.delivery?.lng;
  if (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng)
  ) {
    const config = await getServiceAreaConfig();
    const miles = metersToMiles(
      haversineM({ lat: config.lat, lng: config.lng }, { lat, lng })
    );
    const travel = evaluateTravelPricing({
      miles,
      radiusMiles: config.radiusMiles,
      farFee: config.farFee,
      exceptions: config.exceptions,
      zip: input.delivery?.zip ?? undefined,
    });
    travelAllowed = travel.allowed;
    travelBand = travel.band;
    travelLabel = travel.label;
    beyondRadius = travel.beyondRadius;
    travelMiles = travel.miles;
    if (travel.allowed) {
      travelCents = travel.feeCents;
    }
  }

  const rawSubtotal =
    assemblyCents + pickupCents + deliveryCents + travelCents;
  const subtotalCents = travelAllowed ? rawSubtotal : 0;
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
    travelAllowed,
    travelBand,
    subtotalCents,
    depositCents,
    balanceCents,
    lineCount: items.length,
  };
}
