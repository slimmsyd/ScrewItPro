"use client";

import Image from "next/image";
import { motion, MotionConfig } from "framer-motion";
import {
 Briefcase,
 GraduationCap,
 HeartHandshake,
 Home,
 KeyRound,
 type LucideIcon,
} from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import { ASSETS } from "@/lib/site";

const audiences: {
 icon: LucideIcon;
 title: string;
 body: string;
}[] = [
 {
 icon: Briefcase,
 title: "Busy Professionals",
 body: "Skip the assembly headaches and get back to what matters most.",
 },
 {
 icon: HeartHandshake,
 title: "Seniors",
 body: "Safe, convenient furniture assembly without the physical strain.",
 },
 {
 icon: Home,
 title: "Families",
 body: "No tools, no mess, no weekend projects taking over your home.",
 },
 {
 icon: GraduationCap,
 title: "College Students",
 body: "Get your apartment or dorm furnished quickly and affordably.",
 },
 {
 icon: KeyRound,
 title: "Property Managers",
 body: "Fast furniture setup for model units, rentals, and furnished properties.",
 },
];

const CARD_W = 262;
const GAP = 16;

function AudienceCard({
 icon: Icon,
 title,
 body,
}: {
 icon: LucideIcon;
 title: string;
 body: string;
}) {
 return (
 <div
 style={{
 display: "flex",
 flexDirection: "column",
 gap: 10,
 padding: 22,
 borderRadius: "var(--radius-lg)",
 background: "var(--gray-50)",
 border: "1px solid var(--gray-100)",
 width: CARD_W,
 minWidth: CARD_W,
 flex: `0 0 ${CARD_W}px`,
 boxSizing: "border-box",
 }}
 >
 <Icon size={24} color="var(--blue-electric)" aria-hidden />
 <div
 style={{
 fontFamily: "var(--font-body)",
 fontSize: 15.5,
 fontWeight: 600,
 color: "var(--text-heading)",
 }}
 >
 {title}
 </div>
 <div
 style={{
 fontFamily: "var(--font-body)",
 fontSize: 13.5,
 lineHeight: 1.5,
 color: "var(--text-muted)",
 }}
 >
 {body}
 </div>
 </div>
 );
}

/**
 * "Built for the Way You Live" - infinite horizontal marquee.
 * Duplicated card strip + Framer Motion x loop (pixel distance).
 */
export default function Audiences() {
 const trackRef = useRef<HTMLDivElement>(null);
 const [halfWidth, setHalfWidth] = useState(0);

 // Width of one full set (5 cards + 4 gaps) - exact loop distance
 const oneSetWidth =
 audiences.length * CARD_W + (audiences.length - 1) * GAP;

 useLayoutEffect(() => {
 const el = trackRef.current;
 if (!el) return;
 const measure = () => {
 const w = el.scrollWidth / 2;
 setHalfWidth(w > 0 ? w : oneSetWidth);
 };
 measure();
 const ro = new ResizeObserver(measure);
 ro.observe(el);
 return () => ro.disconnect();
 }, [oneSetWidth]);

 const loopDistance = halfWidth || oneSetWidth;
 // ~42px/sec - smooth continuous crawl
 const duration = Math.max(18, loopDistance / 42);

 return (
 <>
 <section
 style={{
 background: "var(--white)",
 padding: "var(--section-pad-y) 0",
 overflow: "hidden",
 }}
 >
 <Container>
 <Eyebrow>Who We Serve</Eyebrow>
 <SectionTitle>Built for the Way You Live</SectionTitle>
 </Container>

 <div
 style={{
 marginTop: 40,
 overflow: "hidden",
 width: "100%",
 maskImage:
 "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
 WebkitMaskImage:
 "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
 }}
 >
 {/* reducedMotion never - app MotionConfig uses "user" and would freeze this */}
 <MotionConfig reducedMotion="never">
 <motion.div
 ref={trackRef}
 style={{
 display: "flex",
 flexDirection: "row",
 flexWrap: "nowrap",
 gap: GAP,
 width: "max-content",
 willChange: "transform",
 }}
 animate={{ x: [0, -loopDistance] }}
 transition={{
 duration,
 ease: "linear",
 repeat: Infinity,
 repeatType: "loop",
 }}
 aria-label="Audience types, scrolling continuously"
 >
 {audiences.map((a) => (
 <AudienceCard key={`a-${a.title}`} {...a} />
 ))}
 {audiences.map((a) => (
 <AudienceCard key={`b-${a.title}`} {...a} />
 ))}
 </motion.div>
 </MotionConfig>
 </div>
 </section>

 <section
 style={{
 background: "var(--white)",
 paddingTop: 8,
 position: "relative",
 overflow: "hidden",
 }}
 >
 <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>
 <Image
 src={ASSETS.audiencesCrew}
 alt="The ScrewIt Pros community - busy professionals, seniors, families, students, and property managers"
 width={1080}
 height={600}
 style={{ display: "block", width: "100%", height: "auto" }}
 />
 </div>
 <div
 style={{
 position: "absolute",
 left: 0,
 right: 0,
 bottom: 0,
 height: 240,
 background:
 "linear-gradient(to bottom, rgba(244,246,251,0) 0%, var(--gray-50) 90%)",
 pointerEvents: "none",
 }}
 />
 </section>
 </>
 );
}
