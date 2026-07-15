/**
 * Houston Metro Places autocomplete helpers.
 * Client-only - uses Maps JS Places library via loadGoogleMaps.
 *
 * Prediction strategy: no `types` filter so results include street addresses
 * and establishments (IKEA, Target, apartments, etc.) for furniture pickup.
 */

import { isGoogleMapsConfigured, loadGoogleMaps } from "@/lib/google";

/** Downtown Houston - bias + service-area center */
export const HOUSTON_CENTER = { lat: 29.7604, lng: -95.3698 } as const;

/** ~50 miles - covers Katy, Sugar Land, The Woodlands, Pearland, etc. */
export const HOUSTON_METRO_RADIUS_M = 80_000;

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

function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function isInHoustonMetro(lat: number, lng: number, state?: string): boolean {
  if (state && state.toUpperCase() !== "TX") return false;
  return (
    haversineM(HOUSTON_CENTER, { lat, lng }) <= HOUSTON_METRO_RADIUS_M
  );
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
    // Ensure Places library is actually available (script may have loaded without it first)
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
 * Debounced caller should invoke this. Returns up to 6 Houston-biased suggestions.
 * Uses establishment-friendly predictions (no type filter).
 */
export async function fetchPlacePredictions(
  input: string
): Promise<PlaceSuggestion[]> {
  const q = input.trim();
  if (q.length < 2) return [];

  await ensurePlaces();

  const service = new google.maps.places.AutocompleteService();
  const token = currentSessionToken();
  const center = new google.maps.LatLng(HOUSTON_CENTER.lat, HOUSTON_CENTER.lng);

  const predictions = await new Promise<
    google.maps.places.AutocompletePrediction[]
  >((resolve, reject) => {
    service.getPlacePredictions(
      {
        input: q,
        // No `types` → addresses + establishments (stores, apartments, etc.)
        componentRestrictions: { country: "us" },
        location: center,
        radius: HOUSTON_METRO_RADIUS_M,
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
      p.description.replace(p.structured_formatting?.main_text ?? "", "").trim() ||
      "",
  }));
}

/**
 * Resolve a place_id to lat/lng + service-area flag.
 * Ends the autocomplete session (session token consumed).
 */
export async function resolvePlace(placeId: string): Promise<ResolvedPlace> {
  await ensurePlaces();

  const token = currentSessionToken();
  // PlacesService needs a DOM node attribution anchor
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
          // Session ends after details - mint a new token for the next typeahead
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

  const state = component(place.address_components, "administrative_area_level_1", true);
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
    inServiceArea: isInHoustonMetro(lat, lng, state),
  };
}
