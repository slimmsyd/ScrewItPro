/**
 * Pure travel-pricing rules — Model 1 (free zone + out-of-area fee).
 *
 * Product lock (owner):
 * - "We travel up to X mi" = free travel zone (no travel fee on the quote).
 * - Outside radius: still bookable (soft wall); fee = ops.farFee; show on Price.
 * - Distance tiers in Settings are reserved for a future graduated model —
 *   they do NOT affect customer quote fees under Model 1.
 * - ZIP refuse: only hard block. ZIP surcharge: farFee while still bookable.
 *
 * Dollars match ops_rules; feeCents is for quote totals / Stripe deposit base.
 * No I/O — call from API / Settings coverageFor / unit tests.
 */

export type TravelTier = { to: number; fee: number };

export type TravelException = {
  zip: string;
  mode: "surcharge" | "refuse";
  why: string;
};

export type TravelPricingInput = {
  /** Straight-line miles from hub (caller computes; haversine ok for v1). */
  miles: number;
  /** Hub free zone ("We travel up to"). */
  radiusMiles: number;
  /**
   * Reserved — ignored for Model 1 fee math.
   * Kept so Settings/ops_rules shape stays stable.
   */
  tiers?: TravelTier[];
  /** Out-of-area travel fee when miles > radius (ops.farFee). */
  farFee: number;
  exceptions?: TravelException[];
  /** Optional ZIP for exception lookup. */
  zip?: string;
};

export type TravelBand =
  | "in_zone"
  | "beyond_radius"
  | "zip_surcharge"
  | "zip_refuse";

export type TravelPricingResult = {
  /** False only for explicit refuse (ZIP). Outside radius stays true. */
  allowed: boolean;
  /** Fee in dollars (same unit as ops_rules). */
  fee: number;
  /** Fee in cents for quote/checkout. */
  feeCents: number;
  band: TravelBand;
  label: string;
  /** True when miles exceed hub radius (soft wall). */
  beyondRadius: boolean;
  /** Miles used after normalize (for UI). */
  miles: number;
};

function dollarsToCents(fee: number): number {
  if (!Number.isFinite(fee) || fee <= 0) return 0;
  return Math.round(fee * 100);
}

function normalizeMiles(miles: number): number {
  if (!Number.isFinite(miles) || miles < 0) return 0;
  return miles;
}

/** Normalize ZIP for matching: digits only, first 5 (handles ZIP+4). */
export function normalizeZip(zip: string | undefined): string {
  if (!zip?.trim()) return "";
  const digits = zip.replace(/\D/g, "");
  if (digits.length >= 5) return digits.slice(0, 5);
  return digits;
}

function matchZipException(
  exceptions: TravelException[] | undefined,
  zip: string | undefined
): TravelException | undefined {
  const needle = normalizeZip(zip);
  if (!needle || !exceptions?.length) return undefined;
  return exceptions.find((e) => {
    const ez = normalizeZip(e.zip);
    return ez.length > 0 && ez === needle;
  });
}

/**
 * Evaluate travel fee and bookability from miles + optional ZIP.
 * Pure: no hub geocode, no DB, no Maps.
 */
export function evaluateTravelPricing(
  input: TravelPricingInput
): TravelPricingResult {
  const miles = normalizeMiles(input.miles);
  const radiusMiles =
    Number.isFinite(input.radiusMiles) && input.radiusMiles > 0
      ? input.radiusMiles
      : 0;
  const farFee =
    Number.isFinite(input.farFee) && input.farFee > 0 ? input.farFee : 0;
  const beyondRadius = miles > radiusMiles;

  const ex = matchZipException(input.exceptions, input.zip);
  if (ex?.mode === "refuse") {
    return {
      allowed: false,
      fee: 0,
      feeCents: 0,
      band: "zip_refuse",
      label: `ZIP ${ex.zip} refused${ex.why ? ` - ${ex.why}` : ""}`,
      beyondRadius,
      miles,
    };
  }
  if (ex?.mode === "surcharge") {
    return {
      allowed: true,
      fee: farFee,
      feeCents: dollarsToCents(farFee),
      band: "zip_surcharge",
      label: `ZIP exception surcharge · +$${farFee.toFixed(0)}`,
      beyondRadius,
      miles,
    };
  }

  // Model 1: inside free zone → $0 travel (tiers ignored).
  if (!beyondRadius) {
    return {
      allowed: true,
      fee: 0,
      feeCents: 0,
      band: "in_zone",
      label: "No travel fee",
      beyondRadius: false,
      miles,
    };
  }

  // Outside radius: soft wall + farFee.
  return {
    allowed: true,
    fee: farFee,
    feeCents: dollarsToCents(farFee),
    band: "beyond_radius",
    label: farFee
      ? `Outside ${radiusMiles} mi · +$${farFee.toFixed(0)} travel`
      : `Outside ${radiusMiles} mi · no travel fee`,
    beyondRadius: true,
    miles,
  };
}

/**
 * Adapter for Settings "Check an address" preview (legacy shape).
 */
export function coverageFromTravelPricing(
  result: TravelPricingResult
):
  | { ok: true; fee: number; label: string }
  | { ok: false; fee: 0; label: string } {
  if (!result.allowed) {
    return { ok: false, fee: 0, label: result.label };
  }
  return { ok: true, fee: result.fee, label: result.label };
}

/** Meters → miles (for haversine distance from hub). */
export function metersToMiles(meters: number): number {
  if (!Number.isFinite(meters) || meters < 0) return 0;
  return meters / 1609.34;
}
