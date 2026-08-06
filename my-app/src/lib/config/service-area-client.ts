/**
 * Browser fetch of public service-area config (module-level session cache).
 * Includes farFee + ZIP exceptions for Model 1 travel preview (server re-prices).
 */
import {
  defaultsFromBusiness,
  parseTravelExceptions,
  type ServiceAreaConfig,
} from "@/lib/config/service-area";

let cached: ServiceAreaConfig | null = null;
let inflight: Promise<ServiceAreaConfig> | null = null;

export function clearServiceAreaClientCache(): void {
  cached = null;
  inflight = null;
}

export async function fetchServiceAreaConfig(): Promise<ServiceAreaConfig> {
  if (cached) return cached;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch("/api/public/service-area", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!res.ok) return defaultsFromBusiness();
      const json = (await res.json()) as {
        ok?: boolean;
        address?: string;
        lat?: number;
        lng?: number;
        radiusMiles?: number;
        radiusM?: number;
        farFee?: number;
        exceptions?: unknown;
      };
      if (
        !json.ok ||
        typeof json.lat !== "number" ||
        typeof json.lng !== "number" ||
        typeof json.radiusMiles !== "number" ||
        typeof json.radiusM !== "number"
      ) {
        return defaultsFromBusiness();
      }
      const d = defaultsFromBusiness();
      const farFee =
        typeof json.farFee === "number" &&
        Number.isFinite(json.farFee) &&
        json.farFee >= 0
          ? json.farFee
          : d.farFee;
      const next: ServiceAreaConfig = {
        address: json.address?.trim() || d.address,
        lat: json.lat,
        lng: json.lng,
        radiusMiles: json.radiusMiles,
        radiusM: json.radiusM,
        farFee,
        exceptions: parseTravelExceptions(json.exceptions),
      };
      cached = next;
      return next;
    } catch {
      return defaultsFromBusiness();
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
