/**
 * Houston Metro Places autocomplete helpers.
 * Client-only - uses Maps JS Places library via loadGoogleMaps.
 *
 * Service area center + radius come from GET /api/public/service-area
 * (Admin Settings hub). BUSINESS.geo is fallback only.
 */

import { isGoogleMapsConfigured, loadGoogleMaps } from "@/lib/google";
import { BUSINESS } from "@/lib/seo/business";
import {
  isInServiceArea,
  type ServiceAreaConfig,
} from "@/lib/config/service-area";
import { fetchServiceAreaConfig } from "@/lib/config/service-area-client";

/** Fallback constants (sync). Prefer await getServiceArea() for live radius. */
export const HOUSTON_CENTER = {
  lat: BUSINESS.geo.lat,
  lng: BUSINESS.geo.lng,
} as const;

/** @deprecated Prefer live config.radiusM - kept for any sync callers. */
export const HOUSTON_METRO_RADIUS_M = BUSINESS.geo.radiusM;

export type PlaceSuggestion = {
  placeId: string;
  primary: string;
  secondary: string;
};

export type ResolvedPlace = {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  zip?: string;
  inServiceArea: boolean;
};

let sessionToken: google.maps.places.AutocompleteSessionToken | null = null;
let placesReady: Promise<void> | null = null;

/** Sync gate using BUSINESS defaults only. Prefer isInHoustonMetroAsync. */
export function isInHoustonMetro(
  lat: number,
  lng: number,
  state?: string
): boolean {
  return isInServiceArea(lat, lng, state, {
    address: "Houston, TX",
    lat: BUSINESS.geo.lat,
    lng: BUSINESS.geo.lng,
    radiusMiles: BUSINESS.geo.radiusMiles,
    radiusM: BUSINESS.geo.radiusM,
    farFee: 45,
    exceptions: [],
  });
}

export async function isInHoustonMetroAsync(
  lat: number,
  lng: number,
  state?: string
): Promise<boolean> {
  const config = await fetchServiceAreaConfig();
  return isInServiceArea(lat, lng, state, config);
}

export async function getServiceArea(): Promise<ServiceAreaConfig> {
  return fetchServiceAreaConfig();
}

function component(
  components: google.maps.GeocoderAddressComponent[] | undefined,
  type: string,
  short = false
): string | undefined {
  const c = components?.find((x) => x.types.includes(type));
  return short ? c?.short_name : c?.long_name;
}

async function ensurePlaces(): Promise<void> {
  if (!isGoogleMapsConfigured()) {
    throw new Error("Google Maps is not configured");
  }
  if (placesReady) return placesReady;

  placesReady = (async () => {
    const g = await loadGoogleMaps(["places"]);
    if (!g.maps.places) {
      const mapsWithImport = g.maps as typeof google.maps & {
        importLibrary?: (name: string) => Promise<unknown>;
      };
      if (typeof mapsWithImport.importLibrary === "function") {
        await mapsWithImport.importLibrary("places");
      }
    }
    if (!g.maps.places) {
      placesReady = null;
      throw new Error("Places library failed to load");
    }
  })();

  return placesReady;
}

function freshSessionToken(): google.maps.places.AutocompleteSessionToken {
  sessionToken = new google.maps.places.AutocompleteSessionToken();
  return sessionToken;
}

function currentSessionToken(): google.maps.places.AutocompleteSessionToken {
  if (!sessionToken) return freshSessionToken();
  return sessionToken;
}

/**
 * Debounced caller should invoke this. Returns up to 6 hub-biased suggestions.
 */
export async function fetchPlacePredictions(
  input: string
): Promise<PlaceSuggestion[]> {
  const q = input.trim();
  if (q.length < 2) return [];

  await ensurePlaces();
  const config = await fetchServiceAreaConfig();

  const service = new google.maps.places.AutocompleteService();
  const token = currentSessionToken();
  const center = new google.maps.LatLng(config.lat, config.lng);

  const predictions = await new Promise<
    google.maps.places.AutocompletePrediction[]
  >((resolve, reject) => {
    service.getPlacePredictions(
      {
        input: q,
        componentRestrictions: { country: "us" },
        location: center,
        radius: config.radiusM,
        sessionToken: token,
      },
      (results, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          resolve(results);
          return;
        }
        if (
          status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
        ) {
          resolve([]);
          return;
        }
        reject(new Error(`Places autocomplete failed: ${status}`));
      }
    );
  });

  return predictions.slice(0, 6).map((p) => ({
    placeId: p.place_id,
    primary: p.structured_formatting?.main_text || p.description,
    secondary:
      p.structured_formatting?.secondary_text ||
      p.description
        .replace(p.structured_formatting?.main_text ?? "", "")
        .trim() ||
      "",
  }));
}

/**
 * Resolve a place_id to lat/lng + service-area flag using live hub config.
 */
export async function resolvePlace(placeId: string): Promise<ResolvedPlace> {
  await ensurePlaces();
  const config = await fetchServiceAreaConfig();

  const token = currentSessionToken();
  const attr = document.createElement("div");
  const service = new google.maps.places.PlacesService(attr);

  const place = await new Promise<google.maps.places.PlaceResult>(
    (resolve, reject) => {
      service.getDetails(
        {
          placeId,
          fields: [
            "place_id",
            "name",
            "formatted_address",
            "geometry",
            "address_components",
          ],
          sessionToken: token,
        },
        (result, status) => {
          sessionToken = null;
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            result
          ) {
            resolve(result);
            return;
          }
          reject(new Error(`Place details failed: ${status}`));
        }
      );
    }
  );

  const lat = place.geometry?.location?.lat();
  const lng = place.geometry?.location?.lng();
  if (lat == null || lng == null) {
    throw new Error("Place has no coordinates");
  }

  const state = component(
    place.address_components,
    "administrative_area_level_1",
    true
  );
  const city =
    component(place.address_components, "locality") ||
    component(place.address_components, "sublocality") ||
    component(place.address_components, "neighborhood");
  const zip = component(place.address_components, "postal_code");

  return {
    placeId: place.place_id || placeId,
    name: place.name || "",
    formattedAddress: place.formatted_address || place.name || "",
    lat,
    lng,
    city,
    state,
    zip,
    inServiceArea: isInServiceArea(lat, lng, state, config),
  };
}
