"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
 Armchair,
 ArrowRight,
 BadgeCheck,
 BedDouble,
 Briefcase,
 DoorClosed,
 Monitor,
 PackageOpen,
 Search,
 Sofa,
 Sparkles,
 Truck,
 Zap,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CTA_LABEL } from "@/lib/site";

const iconMap = {
 "package-open": PackageOpen,
 armchair: Armchair,
 "bed-double": BedDouble,
 monitor: Monitor,
 "door-closed": DoorClosed,
 briefcase: Briefcase,
 sofa: Sofa,
 truck: Truck,
 sparkles: Sparkles,
 "badge-check": BadgeCheck,
} as const;

const searchServices = [
 { icon: "package-open" as const, label: "IKEA Assembly", hint: "Most booked" },
 { icon: "armchair" as const, label: "General Furniture Assembly", hint: "From $49" },
 { icon: "bed-double" as const, label: "Bed Assembly", hint: "From $69" },
 { icon: "monitor" as const, label: "Desk Assembly", hint: "From $59" },
 { icon: "door-closed" as const, label: "Wardrobe Assembly", hint: "From $99" },
 { icon: "briefcase" as const, label: "Office Furniture Assembly", hint: "For teams" },
 { icon: "sofa" as const, label: "Large Furniture Assembly", hint: "From $129" },
 { icon: "truck" as const, label: "Pickup & Delivery", hint: "Door to door" },
 { icon: "sparkles" as const, label: "White Glove Delivery", hint: "Placed & inspected" },
 { icon: "badge-check" as const, label: "Membership Plans", hint: "From $29/mo" },
];

function highlightMatch(label: string, query: string) {
 const s = query.trim();
 if (!s) return label;
 const idx = label.toLowerCase().indexOf(s.toLowerCase());
 if (idx === -1) return label;
 return (
 <>
 {label.slice(0, idx)}
 <span style={{ color: "var(--blue-electric)", fontWeight: 700 }}>
 {label.slice(idx, idx + s.length)}
 </span>
 {label.slice(idx + s.length)}
 </>
 );
}

export default function HeroSearch({ onCta }: { onCta: () => void }) {
 const [q, setQ] = useState("");
 const [open, setOpen] = useState(false);
 const [active, setActive] = useState(0);
 const wrapRef = useRef<HTMLDivElement>(null);
 const mobile = useIsMobile();

 const filtered = useMemo(() => {
 const s = q.trim().toLowerCase();
 if (!s) return searchServices;
 return searchServices.filter((x) => x.label.toLowerCase().includes(s));
 }, [q]);

 useEffect(() => setActive(0), [q]);
 useEffect(() => {
 function onDoc(e: MouseEvent) {
 if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
 setOpen(false);
 }
 document.addEventListener("mousedown", onDoc);
 return () => document.removeEventListener("mousedown", onDoc);
 }, []);

 const pick = (item: (typeof searchServices)[0]) => {
 setQ(item.label);
 setOpen(false);
 onCta();
 };

 const onKey = (e: React.KeyboardEvent) => {
 if (e.key === "ArrowDown") {
 e.preventDefault();
 if (!open) {
 setOpen(true);
 return;
 }
 setActive((a) => Math.min(a + 1, filtered.length - 1));
 } else if (e.key === "ArrowUp") {
 e.preventDefault();
 setActive((a) => Math.max(a - 1, 0));
 } else if (e.key === "Enter") {
 if (open && filtered[active]) pick(filtered[active]);
 else onCta();
 } else if (e.key === "Escape") {
 setOpen(false);
 }
 };

 return (
 <div
 ref={wrapRef}
 style={{
 position: "relative",
 width: "100%",
 maxWidth: 660,
 marginBottom: mobile ? 34 : 48,
 // Above hero chrome; hero itself sits above following sections
 zIndex: 50,
 isolation: "isolate",
 }}
 >
 <div
 style={{
 display: "flex",
 alignItems: "center",
 height: mobile ? 56 : 64,
 background: "var(--white)",
 borderRadius: "var(--radius-pill)",
 paddingLeft: mobile ? 16 : 22,
 border: `1px solid ${open ? "var(--blue-electric)" : "var(--gray-200)"}`,
 boxShadow: open
 ? "0 0 0 4px rgba(29,110,254,0.14), var(--shadow-lg)"
 : "var(--shadow-md)",
 transition:
 "border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-fast) var(--ease-out)",
 }}
 >
 <Search
 size={20}
 color={open ? "var(--blue-electric)" : "var(--ink-300)"}
 />
 <input
 value={q}
 onChange={(e) => {
 setQ(e.target.value);
 setOpen(true);
 }}
 onFocus={() => setOpen(true)}
 onKeyDown={onKey}
 placeholder="What do you need assembled?"
 aria-label="What do you need assembled?"
 style={{
 flex: 1,
 border: "none",
 outline: "none",
 padding: mobile ? "0 10px" : "0 16px",
 fontFamily: "var(--font-body)",
 fontSize: mobile ? 16 : 16.5,
 color: "var(--ink-900)",
 background: "transparent",
 minWidth: 0,
 }}
 />
 <button
 type="button"
 onClick={onCta}
 aria-label={CTA_LABEL}
 style={{
 border: "none",
 cursor: "pointer",
 background: "var(--blue-deep)",
 color: "var(--white)",
 fontFamily: "var(--font-body)",
 fontSize: 15.5,
 fontWeight: 600,
 height: mobile ? 42 : 50,
 margin: mobile ? 6 : 7,
 padding: mobile ? "0 14px" : "0 24px",
 borderRadius: "var(--radius-pill)",
 display: "flex",
 alignItems: "center",
 gap: 8,
 flex: "none",
 }}
 onMouseEnter={(e) =>
 (e.currentTarget.style.background = "var(--blue-700)")
 }
 onMouseLeave={(e) =>
 (e.currentTarget.style.background = "var(--blue-deep)")
 }
 >
 {mobile ? (
 <ArrowRight size={20} color="var(--white)" />
 ) : (
 <>
 {CTA_LABEL} <ArrowRight size={17} color="var(--white)" />
 </>
 )}
 </button>
 </div>

 {open && (
 <div
 role="listbox"
 style={{
 position: "absolute",
 top: "calc(100% + 12px)",
 left: 0,
 right: 0,
 zIndex: 60,
 background: "var(--white)",
 border: "1px solid var(--gray-100)",
 borderRadius: 20,
 boxShadow: "var(--shadow-lg)",
 padding: 8,
 textAlign: "left",
 overflow: "hidden",
 }}
 >
 <div
 style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 padding: "8px 12px 10px",
 fontFamily: "var(--font-body)",
 fontSize: 12,
 fontWeight: 600,
 letterSpacing: "var(--tracking-caps)",
 textTransform: "uppercase",
 color: "var(--ink-300)",
 }}
 >
 <span>{q.trim() ? "Matching services" : "Popular services"}</span>
 <span
 style={{
 display: "flex",
 alignItems: "center",
 gap: 5,
 letterSpacing: 0,
 textTransform: "none",
 fontWeight: 500,
 }}
 >
 <Zap size={13} /> Instant quote
 </span>
 </div>
 {filtered.length > 0 ? (
 <div
 style={{
 maxHeight: 268,
 overflowY: "auto",
 display: "flex",
 flexDirection: "column",
 gap: 2,
 }}
 >
 {filtered.map((item, i) => {
 const Icon = iconMap[item.icon];
 const isActive = i === active;
 return (
 <button
 key={item.label}
 type="button"
 onMouseEnter={() => setActive(i)}
 onMouseDown={(e) => {
 e.preventDefault();
 pick(item);
 }}
 style={{
 display: "flex",
 alignItems: "center",
 gap: 14,
 width: "100%",
 textAlign: "left",
 padding: "10px 12px",
 border: "none",
 borderRadius: "var(--radius-md)",
 cursor: "pointer",
 background: isActive ? "var(--blue-50)" : "transparent",
 }}
 >
 <span
 style={{
 width: 40,
 height: 40,
 flex: "none",
 borderRadius: 10,
 display: "flex",
 alignItems: "center",
 justifyContent: "center",
 background: isActive
 ? "var(--blue-100)"
 : "var(--gray-50)",
 }}
 >
 <Icon
 size={20}
 color={
 isActive ? "var(--blue-deep)" : "var(--ink-500)"
 }
 />
 </span>
 <span
 style={{
 flex: 1,
 fontFamily: "var(--font-body)",
 fontSize: 15.5,
 fontWeight: 600,
 color: "var(--ink-900)",
 }}
 >
 {highlightMatch(item.label, q)}
 </span>
 <span
 style={{
 fontFamily: "var(--font-body)",
 fontSize: 13,
 color: "var(--ink-500)",
 flex: "none",
 }}
 >
 {item.hint}
 </span>
 <ArrowRight
 size={16}
 color={
 isActive ? "var(--blue-electric)" : "transparent"
 }
 />
 </button>
 );
 })}
 </div>
 ) : (
 <div
 style={{
 padding: "18px 12px",
 fontFamily: "var(--font-body)",
 fontSize: 15,
 color: "var(--ink-500)",
 }}
 >
 No match for “{q.trim()}” - we still probably build it.
 </div>
 )}
 <button
 type="button"
 onMouseDown={(e) => {
 e.preventDefault();
 setOpen(false);
 onCta();
 }}
 style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 width: "100%",
 marginTop: 6,
 padding: "13px 12px",
 border: "none",
 borderTop: "1px solid var(--gray-100)",
 background: "transparent",
 cursor: "pointer",
 textAlign: "left",
 }}
 >
 <span
 style={{
 fontFamily: "var(--font-body)",
 fontSize: 14.5,
 fontWeight: 600,
 color: "var(--blue-deep)",
 }}
 >
 Don’t see it? Get a free custom quote
 </span>
 <ArrowRight size={16} color="var(--blue-electric)" />
 </button>
 </div>
 )}
 </div>
 );
}
