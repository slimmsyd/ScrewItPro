"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { isGoogleMapsConfigured, loadGoogleMaps } from "@/lib/google";

/** Downtown Houston - map center */
const HOUSTON = { lat: 29.7604, lng: -95.3698 };

/** ~55 km ≈ covers greater Houston metro (Beltway + suburbs) */
const COVERAGE_RADIUS_M = 55_000;

/** Brand-aligned muted map style (blues / cool grays) */
const MAP_STYLES: google.maps.MapTypeStyle[] = [
 { elementType: "geometry", stylers: [{ color: "#f4f6fb" }] },
 { elementType: "labels.text.fill", stylers: [{ color: "#2a3050" }] },
 { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
 {
 featureType: "administrative",
 elementType: "geometry.stroke",
 stylers: [{ color: "#d8ddeb" }],
 },
 {
 featureType: "poi",
 elementType: "geometry",
 stylers: [{ color: "#e9edf6" }],
 },
 {
 featureType: "poi.park",
 elementType: "geometry",
 stylers: [{ color: "#e5f5ee" }],
 },
 {
 featureType: "road",
 elementType: "geometry",
 stylers: [{ color: "#ffffff" }],
 },
 {
 featureType: "road",
 elementType: "geometry.stroke",
 stylers: [{ color: "#d8ddeb" }],
 },
 {
 featureType: "road.highway",
 elementType: "geometry",
 stylers: [{ color: "#dce7ff" }],
 },
 {
 featureType: "road.highway",
 elementType: "geometry.stroke",
 stylers: [{ color: "#b3ccff" }],
 },
 {
 featureType: "transit",
 stylers: [{ visibility: "off" }],
 },
 {
 featureType: "water",
 elementType: "geometry",
 stylers: [{ color: "#b3ccff" }],
 },
 {
 featureType: "water",
 elementType: "labels.text.fill",
 stylers: [{ color: "#436db5" }],
 },
];

type Props = {
 height: number | string;
};

/**
 * Interactive Google Map of Houston Metro coverage.
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (Maps JavaScript API enabled).
 */
export default function HoustonMap({ height }: Props) {
 const hostRef = useRef<HTMLDivElement>(null);
 const mapRef = useRef<google.maps.Map | null>(null);
 const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">(
 () => (isGoogleMapsConfigured() ? "loading" : "missing")
 );
 const [errorMsg, setErrorMsg] = useState("");

 useEffect(() => {
 if (!isGoogleMapsConfigured()) {
 setStatus("missing");
 return;
 }
 if (!hostRef.current) return;

 let cancelled = false;

 (async () => {
 try {
 const g = await loadGoogleMaps(["maps"]);
 if (cancelled || !hostRef.current) return;

 // Avoid re-init on strict mode double-mount without clearing
 if (mapRef.current) {
 setStatus("ready");
 return;
 }

 const map = new g.maps.Map(hostRef.current, {
 center: HOUSTON,
 zoom: 9,
 mapTypeControl: false,
 streetViewControl: false,
 fullscreenControl: true,
 zoomControl: true,
 clickableIcons: false,
 styles: MAP_STYLES,
 gestureHandling: "cooperative",
 });

 // Hub pin
 new g.maps.Marker({
 map,
 position: HOUSTON,
 title: "ScrewIt Pros - Houston Metro",
 // Classic red pin is fine; brand circle below is the coverage story
 });

 // Coverage radius
 new g.maps.Circle({
 map,
 center: HOUSTON,
 radius: COVERAGE_RADIUS_M,
 fillColor: "#1D6EFE",
 fillOpacity: 0.14,
 strokeColor: "#04209B",
 strokeOpacity: 0.55,
 strokeWeight: 2,
 clickable: false,
 });

 // Info window on open
 const info = new g.maps.InfoWindow({
 content: `
 <div style="font-family:system-ui,sans-serif;padding:4px 2px;max-width:200px">
 <strong style="color:#04209B">Houston Metro</strong>
 <div style="font-size:12px;color:#545B7A;margin-top:4px">
 ScrewIt Pros service area - pickup, assembly & white-glove delivery.
 </div>
 </div>
 `,
 position: HOUSTON,
 });
 info.open({ map });

 mapRef.current = map;
 setStatus("ready");
 } catch (e) {
 if (cancelled) return;
 console.error("[HoustonMap]", e);
 setErrorMsg(
 e instanceof Error ? e.message : "Failed to load Google Maps"
 );
 setStatus("error");
 }
 })();

 return () => {
 cancelled = true;
 };
 }, []);

 if (status === "missing") {
 return (
 <div
 style={{
 background: "var(--gray-100)",
 borderRadius: "var(--radius-xl)",
 height,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 flexDirection: "column",
 gap: 10,
 color: "var(--ink-500)",
 fontFamily: "var(--font-body)",
 fontSize: 14,
 padding: 24,
 textAlign: "center",
 }}
 >
 <MapPin size={32} color="var(--ink-300)" />
 <div style={{ fontWeight: 600, color: "var(--ink-700)" }}>
 Map: Houston Metro coverage
 </div>
 <div style={{ maxWidth: 360, fontSize: 13, color: "var(--ink-300)" }}>
 Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{" "}
 <code>.env.local</code> (enable Maps JavaScript API), then restart{" "}
 <code>npm run dev</code>.
 </div>
 </div>
 );
 }

 return (
 <div
 style={{
 position: "relative",
 borderRadius: "var(--radius-xl)",
 overflow: "hidden",
 height,
 background: "var(--gray-100)",
 border: "1px solid var(--gray-200)",
 boxShadow: "var(--shadow-md)",
 }}
 >
 <div ref={hostRef} style={{ width: "100%", height: "100%" }} />

 {(status === "loading" || status === "error") && (
 <div
 style={{
 position: "absolute",
 inset: 0,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 flexDirection: "column",
 gap: 10,
 background:
 status === "error"
 ? "var(--gray-100)"
 : "rgba(244,246,251,0.72)",
 fontFamily: "var(--font-body)",
 fontSize: 14,
 color: "var(--ink-500)",
 padding: 24,
 textAlign: "center",
 pointerEvents: status === "loading" ? "none" : "auto",
 }}
 >
 {status === "loading" ? (
 <>
 <MapPin size={28} color="var(--blue-electric)" />
 Loading Houston map…
 </>
 ) : (
 <>
 <MapPin size={28} color="var(--status-error)" />
 <div style={{ fontWeight: 600, color: "var(--ink-700)" }}>
 Couldn’t load the map
 </div>
 <div style={{ fontSize: 13, maxWidth: 320 }}>{errorMsg}</div>
 </>
 )}
 </div>
 )}

 {status === "ready" && (
 <div
 style={{
 position: "absolute",
 left: 12,
 bottom: 12,
 zIndex: 1,
 background: "rgba(255,255,255,0.94)",
 border: "1px solid var(--gray-200)",
 borderRadius: "var(--radius-md)",
 padding: "8px 12px",
 fontFamily: "var(--font-body)",
 fontSize: 12.5,
 fontWeight: 600,
 color: "var(--blue-deep)",
 boxShadow: "var(--shadow-sm)",
 display: "flex",
 alignItems: "center",
 gap: 8,
 }}
 >
 <span
 style={{
 width: 10,
 height: 10,
 borderRadius: "50%",
 background: "var(--blue-electric)",
 boxShadow: "0 0 0 3px rgba(29,110,254,0.2)",
 }}
 />
 Live service area · Houston Metro
 </div>
 )}
 </div>
 );
}
