"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ASSETS } from "@/lib/site";

/**
 * Compact ScrewIt “thinking” loader - same brand language as the page splash
 * (spinning S mark + progress fill). Use while awaiting API/get/post responses.
 */
export default function ThinkingLoader({
 caption = "Screwing it together…",
 compact = false,
}: {
 caption?: string;
 /** Smaller footprint for chat bubbles / inline panels */
 compact?: boolean;
}) {
 const [progress, setProgress] = useState(8);

 useEffect(() => {
 let p = 8;
 const id = window.setInterval(() => {
 p = Math.min(92, p + Math.random() * 14 + 6);
 setProgress(p);
 }, 160);
 return () => window.clearInterval(id);
 }, []);

 const mark = compact ? 44 : 64;
 const trackW = compact ? 140 : 180;

 return (
 <div
 className="sip-thinking"
 role="status"
 aria-live="polite"
 aria-busy="true"
 style={{
 display: "flex",
 flexDirection: "column",
 alignItems: "center",
 justifyContent: "center",
 gap: compact ? 14 : 18,
 padding: compact ? "20px 12px" : "28px 16px",
 width: "100%",
 }}
 >
 <Image
 src={ASSETS.logoS}
 alt=""
 width={mark}
 height={mark}
 className="sip-thinking-mark"
 style={{
 width: mark,
 height: mark,
 display: "block",
 animation: "splashSpin 1s linear infinite",
 }}
 />
 <div
 style={{
 width: trackW,
 height: 5,
 borderRadius: 999,
 background: "var(--gray-100)",
 overflow: "hidden",
 }}
 >
 <div
 style={{
 height: "100%",
 width: `${progress}%`,
 background: "var(--blue-electric)",
 borderRadius: 999,
 transition: "width 200ms ease-out",
 }}
 />
 </div>
 <div
 style={{
 fontFamily: "var(--font-body)",
 fontSize: compact ? 11 : 12,
 fontWeight: 600,
 letterSpacing: "var(--tracking-caps)",
 textTransform: "uppercase",
 color: "var(--ink-300)",
 textAlign: "center",
 }}
 >
 {caption}
 </div>
 </div>
 );
}
