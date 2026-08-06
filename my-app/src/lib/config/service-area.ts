/**
 * Service area config: hub pin + radius + public farFee (Model 1 travel).
 * BUSINESS.geo is the fallback only; live ops edit app_settings.hub / ops_rules.
 */
import { BUSINESS } from "@/lib/seo/business";

/** Match DEFAULT_OPS.farFee — avoid importing admin/settings (client-safe). */
const DEFAULT_FAR_FEE = 45;

export type ServiceAreaConfig = {
  address: string;
  lat: number;
  lng: number;
  radiusMiles: number;
  radiusM: number;
  /**
   * Out-of-area travel fee (dollars) when miles > radiusMiles.
   * Public — client preview only; server re-prices for Stripe.
   */
  farFee: number;
};

const MI_TO_M = 1609.34;

export function defaultsFromBusiness(): ServiceAreaConfig {
  return {
    address: "Houston, TX",
    lat: BUSINESS.geo.lat,
    lng: BUSINESS.geo.lng,
    radiusMiles: BUSINESS.geo.radiusMiles,
    radiusM: BUSINESS.geo.radiusM,
    farFee: DEFAULT_FAR_FEE,
  };
}

export function milesToMeters(miles: number): number {
  return Math.round(miles * MI_TO_M);
}

/** Normalize hub JSON from app_settings into a full ServiceAreaConfig. */
export function normalizeHub(raw: unknown): ServiceAreaConfig {
  const d = defaultsFromBusiness();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return d;
  const o = raw as Record<string, unknown>;

  const radiusMiles =
    typeof o.radius_miles === "number" && Number.isFinite(o.radius_miles)
      ? o.radius_miles
      : typeof o.radius_miles === "string" && o.radius_miles.trim() !== ""
        ? Number(o.radius_miles)
        : d.radiusMiles;

  const safeMiles =
    Number.isFinite(radiusMiles) && radiusMiles >= 5 && radiusMiles <= 200
      ? radiusMiles
      : d.radiusMiles;

  const lat =
    typeof o.lat === "number" && Number.isFinite(o.lat) ? o.lat : d.lat;
  const lng =
    typeof o.lng === "number" && Number.isFinite(o.lng) ? o.lng : d.lng;

  const radiusM =
    typeof o.radius_m === "number" && Number.isFinite(o.radius_m)
      ? o.radius_m
      : milesToMeters(safeMiles);

  const address =
    typeof o.address === "string" && o.address.trim()
      ? o.address.trim()
      : d.address;

  const farFeeRaw = o.farFee ?? o.far_fee;
  const farFeeNum =
    typeof farFeeRaw === "number" && Number.isFinite(farFeeRaw)
      ? farFeeRaw
      : typeof farFeeRaw === "string" && farFeeRaw.trim() !== ""
        ? Number(farFeeRaw)
        : d.farFee;
  const farFee =
    Number.isFinite(farFeeNum) && farFeeNum >= 0 ? farFeeNum : d.farFee;

  return {
    address,
    lat,
    lng,
    radiusMiles: safeMiles,
    radiusM,
    farFee,
  };
}

export function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Pure gate: TX-only + distance from hub center.
 * Fail closed for non-TX when state is provided.
 */
export function isInServiceArea(
  lat: number,
  lng: number,
  state: string | undefined,
  config: ServiceAreaConfig
): boolean {
  if (state && state.toUpperCase() !== "TX") return false;
  return (
    haversineM({ lat: config.lat, lng: config.lng }, { lat, lng }) <=
    config.radiusM
  );
}

/**
 * Server: load hub + farFee from app_settings; never throw for missing DB.
 * farFee comes from ops_rules (Model 1 out-of-area travel).
 */
export async function getServiceAreaConfig(): Promise<ServiceAreaConfig> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("app_settings")
      .select("key, value")
      .in("key", ["hub", "ops_rules"]);

    if (error || !data?.length) return defaultsFromBusiness();

    const map = new Map(
      data.map((row) => [row.key as string, row.value as unknown])
    );
    const hub = normalizeHub(map.get("hub"));
    const ops = map.get("ops_rules");
    if (ops && typeof ops === "object" && !Array.isArray(ops)) {
      const far = (ops as Record<string, unknown>).farFee;
      if (typeof far === "number" && Number.isFinite(far) && far >= 0) {
        return { ...hub, farFee: far };
      }
    }
    return hub;
  } catch {
    return defaultsFromBusiness();
  }
}
