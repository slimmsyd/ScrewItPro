/**
 * Server-only rate card for draft orders / checkout.
 * Client may display the same numbers via pricing.ts — never trust client cents.
 *
 * Travel (Model 1): recomputed from delivery lat/lng + hub/ops — anti-spoof.
 * Stripe deposit = 30% of subtotal including travelCents.
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
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_OPS } from "@/lib/admin/settings";
import {
  evaluateTravelPricing,
  metersToMiles,
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

async function loadFarFee(): Promise<number> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("app_settings")
      .select("value")
      .eq("key", "ops_rules")
      .maybeSingle();
    if (error || !data?.value || typeof data.value !== "object") {
      return DEFAULT_OPS.farFee;
    }
    const o = data.value as Record<string, unknown>;
    const fee = o.farFee;
    if (typeof fee === "number" && Number.isFinite(fee) && fee >= 0) {
      return fee;
    }
    if (typeof fee === "string" && fee.trim() !== "" && !Number.isNaN(Number(fee))) {
      return Math.max(0, Number(fee));
    }
    return DEFAULT_OPS.farFee;
  } catch {
    return DEFAULT_OPS.farFee;
  }
}

export type ServerPricedDraft = {
  assemblyCents: number;
  pickupCents: number;
  deliveryCents: number;
  travelCents: number;
  travelLabel: string;
  beyondRadius: boolean;
  travelMiles: number;
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

  const lat = input.delivery?.lat;
  const lng = input.delivery?.lng;
  if (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    typeof lng === "number" &&
    Number.isFinite(lng)
  ) {
    const [hub, farFee] = await Promise.all([
      getServiceAreaConfig(),
      loadFarFee(),
    ]);
    const miles = metersToMiles(
      haversineM({ lat: hub.lat, lng: hub.lng }, { lat, lng })
    );
    const travel = evaluateTravelPricing({
      miles,
      radiusMiles: hub.radiusMiles,
      farFee,
      zip: input.delivery?.zip ?? undefined,
    });
    if (travel.allowed) {
      travelCents = travel.feeCents;
      travelLabel = travel.label;
      beyondRadius = travel.beyondRadius;
      travelMiles = travel.miles;
    }
  }

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
    lineCount: items.length,
  };
}
