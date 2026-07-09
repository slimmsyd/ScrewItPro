import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Google Cloud keys for Screw It Pro:
 * - Maps / Places: delivery zones, address autocomplete, geocoding
 * - Analytics: GA4 site measurement
 * - OAuth: optional Google sign-in (often configured in Supabase Auth)
 */

export function isGoogleMapsConfigured(): boolean {
 return Boolean(publicEnv.googleMapsApiKey?.trim());
}

export function isGoogleAnalyticsConfigured(): boolean {
 return Boolean(publicEnv.googleAnalyticsId?.trim());
}

export function isGoogleOAuthConfigured(): boolean {
 return Boolean(
 process.env.GOOGLE_CLIENT_ID?.trim() &&
 process.env.GOOGLE_CLIENT_SECRET?.trim()
 );
}

/** Browser Maps key (Places, JS Maps). */
export function getGoogleMapsApiKey(): string {
 if (!publicEnv.googleMapsApiKey) {
 throw new Error(
 "Google Maps is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY."
 );
 }
 return publicEnv.googleMapsApiKey;
}

/** Server-side geocoding / Distance Matrix key (falls back to public Maps key). */
export function getGoogleMapsServerKey(): string {
 const key =
 serverEnv.googleMapsServerKey || publicEnv.googleMapsApiKey;
 if (!key) {
 throw new Error(
 "Google Maps server key missing. Set GOOGLE_MAPS_SERVER_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY."
 );
 }
 return key;
}

/**
 * Load the Maps JavaScript API (Places library) once.
 * Call from Client Components when you need autocomplete / map UI.
 */
type MapsLibrary = "places" | "geometry" | "marker" | "maps";

/** Shared promise so concurrent callers only inject one script. */
let mapsLoadPromise: Promise<typeof google> | null = null;

export async function loadGoogleMaps(
 libraries: MapsLibrary[] = ["maps"]
): Promise<typeof google> {
 if (typeof window === "undefined") {
 throw new Error("loadGoogleMaps can only run in the browser.");
 }

 // Already fully available
 if (window.google?.maps) {
 return window.google;
 }

 if (mapsLoadPromise) return mapsLoadPromise;

 const key = getGoogleMapsApiKey();
 // "maps" is core - don't pass as library (invalid for some API versions)
 const libs = libraries.filter((l) => l !== "maps");
 const scriptId = "screwitpro-google-maps";

 mapsLoadPromise = new Promise<typeof google>((resolve, reject) => {
 const existing = document.getElementById(
 scriptId
 ) as HTMLScriptElement | null;

 const done = () => {
 if (window.google?.maps) resolve(window.google);
 else reject(new Error("Google Maps loaded but google.maps is missing"));
 };

 if (existing) {
 if (window.google?.maps) {
 done();
 return;
 }
 existing.addEventListener("load", done, { once: true });
 existing.addEventListener(
 "error",
 () => reject(new Error("Maps script failed")),
 { once: true }
 );
 return;
 }

 const params = new URLSearchParams({
 key,
 v: "weekly",
 });
 if (libs.length) params.set("libraries", libs.join(","));

 const script = document.createElement("script");
 script.id = scriptId;
 script.async = true;
 script.defer = true;
 script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
 script.onload = done;
 script.onerror = () => {
 mapsLoadPromise = null;
 reject(
 new Error(
 "Failed to load Google Maps JavaScript API. Check the key, billing, and that Maps JavaScript API is enabled."
 )
 );
 };
 document.head.appendChild(script);
 });

 return mapsLoadPromise;
}

/** Server-side geocode (Places/Geocoding REST). */
export async function geocodeAddress(address: string) {
 const key = getGoogleMapsServerKey();
 const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
 url.searchParams.set("address", address);
 url.searchParams.set("key", key);

 const res = await fetch(url.toString());
 if (!res.ok) {
 throw new Error(`Geocoding failed: ${res.status}`);
 }
 return res.json();
}
