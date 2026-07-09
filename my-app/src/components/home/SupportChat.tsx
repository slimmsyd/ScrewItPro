"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import ThinkingLoader from "@/components/ui/ThinkingLoader";
import { ASSETS, JOIN_PATH } from "@/lib/site";

const PRICES: Record<string, number> = {
 Bed: 129,
 Desk: 69,
 Wardrobe: 129,
 "Office setup": 99,
};

const LOCATION_TIER: Record<string, "live" | "expanding" | "unserved"> = {
 "Houston Metro": "live",
 Austin: "expanding",
 Dallas: "expanding",
 "San Antonio": "expanding",
 Atlanta: "expanding",
 "Somewhere else": "unserved",
};

/** Simulated network latency before Chip replies (swap for real fetch later). */
const THINK_MS = { min: 900, max: 1600 } as const;

function thinkDelay() {
 return (
 THINK_MS.min + Math.floor(Math.random() * (THINK_MS.max - THINK_MS.min))
 );
}

function ChipBubble({ children }: { children: React.ReactNode }) {
 return (
 <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
 <Image
 src={ASSETS.mascot}
 alt=""
 width={26}
 height={26}
 style={{
 width: 26,
 height: 26,
 borderRadius: "50%",
 objectFit: "cover",
 objectPosition: "top",
 flex: "none",
 marginTop: 2,
 }}
 />
 <div
 style={{
 background: "var(--gray-50)",
 border: "1px solid var(--gray-100)",
 borderRadius: "var(--radius-lg)",
 borderTopLeftRadius: 4,
 padding: "10px 14px",
 fontFamily: "var(--font-body)",
 fontSize: 14.5,
 lineHeight: "var(--leading-body)",
 color: "var(--ink-900)",
 maxWidth: 260,
 }}
 >
 {children}
 </div>
 </div>
 );
}

function QuickReplies({
 options,
 onPick,
 disabled,
}: {
 options: string[];
 onPick: (opt: string) => void;
 disabled?: boolean;
}) {
 return (
 <div
 style={{
 display: "flex",
 flexWrap: "wrap",
 gap: 8,
 paddingLeft: 36,
 opacity: disabled ? 0.45 : 1,
 pointerEvents: disabled ? "none" : "auto",
 }}
 >
 {options.map((o) => (
 <button
 key={o}
 type="button"
 disabled={disabled}
 onClick={() => onPick(o)}
 style={{
 padding: "8px 14px",
 borderRadius: "var(--radius-pill)",
 border: "1px solid var(--blue-electric)",
 background: "var(--white)",
 color: "var(--blue-electric)",
 fontFamily: "var(--font-body)",
 fontSize: 13.5,
 fontWeight: 600,
 cursor: disabled ? "default" : "pointer",
 }}
 >
 {o}
 </button>
 ))}
 </div>
 );
}

/**
 * Chip · ScrewIt Pros support chat
 * - Q&A flow from design handoff
 * - Screw-in launcher
 * - Thinking loader between steps (API-ready loading states)
 */
export default function SupportChat() {
 const router = useRouter();
 const [open, setOpen] = useState(false);
 const [greeted, setGreeted] = useState(false);
 const [seen, setSeen] = useState(false);
 const [spin, setSpin] = useState(false);
 const [step, setStep] = useState(0);
 const [answers, setAnswers] = useState<Record<string, string>>({});
 /** Chip is “thinking” - show ScrewIt loader before next message */
 const [thinking, setThinking] = useState(false);
 const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const bodyRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const t = setTimeout(() => setGreeted(true), 2400);
 return () => clearTimeout(t);
 }, []);

 useEffect(() => {
 if (!spin) return;
 const t = setTimeout(() => setSpin(false), 700);
 return () => clearTimeout(t);
 }, [spin]);

 useEffect(() => {
 return () => {
 if (thinkTimer.current) clearTimeout(thinkTimer.current);
 };
 }, []);

 // Keep latest message / loader in view
 useEffect(() => {
 bodyRef.current?.scrollTo({
 top: bodyRef.current.scrollHeight,
 behavior: "smooth",
 });
 }, [step, thinking, open]);

 const tier = answers.location ? LOCATION_TIER[answers.location] : null;

 function buildFlow() {
 const steps: { key: string; q: string; options: string[] }[] = [
 {
 key: "location",
 q: "First - where are you located?",
 options: Object.keys(LOCATION_TIER),
 },
 ];
 if (tier === "unserved") {
 steps.push({
 key: "waitlist",
 q: "We're not quite in your area yet, but I can keep you posted the moment we are.",
 options: ["Join the waitlist"],
 });
 return steps;
 }
 steps.push({
 key: "item",
 q:
 tier === "expanding"
 ? `Good news - we're expanding to ${answers.location} soon. What are we assembling?`
 : "What are we assembling?",
 options: ["Bed", "Desk", "Wardrobe", "Office setup"],
 });
 steps.push({
 key: "pickup",
 q: "Where do we pick it up?",
 options: ["My home", "A store", "Ship to hub"],
 });
 steps.push({
 key: "timeline",
 q: "How soon?",
 options: ["This week", "No rush"],
 });
 return steps;
 }

 const flow = buildFlow();
 const done = !thinking && step >= flow.length;
 const estimate = answers.item ? PRICES[answers.item] : null;

 /**
 * Apply answer after a thinking delay - stand-in for future
 * POST /api/chat or pricing fetch.
 */
 const pick = (opt: string) => {
 if (thinking) return;
 const key = flow[step]?.key;
 if (!key) return;

 setThinking(true);
 if (thinkTimer.current) clearTimeout(thinkTimer.current);

 // Captured for when the “request” resolves
 const nextAnswers = { ...answers, [key]: opt };

 thinkTimer.current = setTimeout(() => {
 setAnswers(nextAnswers);
 setStep((s) => s + 1);
 setThinking(false);
 thinkTimer.current = null;
 }, thinkDelay());
 };

 const reset = () => {
 if (thinkTimer.current) {
 clearTimeout(thinkTimer.current);
 thinkTimer.current = null;
 }
 setThinking(false);
 setAnswers({});
 setStep(0);
 };

 const openChat = () => {
 setSeen(true);
 setSpin(true);
 setOpen(true);
 };

 const closeChat = () => {
 setSpin(true);
 setOpen(false);
 };

 const toggle = () => {
 if (open) closeChat();
 else openChat();
 };

 let bottomLine: string;
 let bottomPrice: string;
 let bottomCta: string | null;

 if (tier === "unserved") {
 bottomLine = "Outside our current service area";
 bottomPrice = "-";
 bottomCta = done ? "Join the waitlist" : null;
 } else if (tier === "expanding") {
 bottomLine = `${answers.item || "-"} ${answers.pickup ? `· ${answers.pickup}` : ""} ${answers.timeline ? `· ${answers.timeline}` : ""} · Est. at launch in ${answers.location}`;
 bottomPrice = estimate ? `$${estimate}` : "-";
 bottomCta = done ? `Join the ${answers.location} waitlist` : null;
 } else {
 bottomLine = `${answers.location ? answers.location + " · " : ""}${answers.item || "-"} ${answers.pickup ? `· ${answers.pickup}` : ""} ${answers.timeline ? `· ${answers.timeline}` : ""}`;
 bottomPrice = estimate ? `$${estimate}` : "-";
 bottomCta = done ? "Get my exact quote" : null;
 }

 // While thinking, show last committed estimate only (no premature final CTA)
 if (thinking) {
 bottomCta = null;
 }

 const onCta = () => {
 router.push(JOIN_PATH);
 };

 const thinkingCaption =
 step >= flow.length - 1 || (tier === "unserved" && step >= 0)
 ? "Building your estimate…"
 : "Chip is thinking…";

 return (
 <>
 {open && (
 <>
 <div
 onClick={closeChat}
 aria-hidden
 style={{
 position: "fixed",
 inset: 0,
 background: "rgba(11,16,48,0.32)",
 zIndex: 1200,
 }}
 />
 <div
 role="dialog"
 aria-modal="true"
 aria-label="Chip support chat"
 style={{
 position: "fixed",
 left: "50%",
 top: "50%",
 transform: "translate(-50%, -50%)",
 zIndex: 1201,
 width: 440,
 maxWidth: "calc(100vw - 32px)",
 maxHeight: "min(600px, calc(100vh - 32px))",
 background: "var(--white)",
 borderRadius: "var(--radius-xl)",
 boxShadow: "var(--shadow-lg)",
 display: "flex",
 flexDirection: "column",
 overflow: "hidden",
 }}
 >
 <div
 style={{
 display: "flex",
 alignItems: "center",
 gap: 12,
 padding: "18px 20px",
 background: "var(--blue-deep)",
 color: "var(--white)",
 }}
 >
 <Image
 src={ASSETS.mascot}
 alt="Chip"
 width={38}
 height={38}
 style={{
 width: 38,
 height: 38,
 borderRadius: "50%",
 objectFit: "cover",
 objectPosition: "top",
 border: "2px solid rgba(255,255,255,0.4)",
 }}
 />
 <div style={{ flex: 1 }}>
 <div
 style={{
 fontFamily: "var(--font-body)",
 fontWeight: 700,
 fontSize: 15,
 }}
 >
 Chip · ScrewIt Pros
 </div>
 <div
 style={{
 fontFamily: "var(--font-body)",
 fontSize: 12.5,
 color: "var(--blue-200)",
 }}
 >
 {thinking
 ? "Thinking…"
 : "Building your quote as we go"}
 </div>
 </div>
 <button
 type="button"
 onClick={closeChat}
 aria-label="Close chat"
 style={{
 background: "transparent",
 border: "none",
 cursor: "pointer",
 color: "var(--blue-200)",
 display: "flex",
 padding: 4,
 }}
 >
 <X size={18} />
 </button>
 </div>

 <div
 ref={bodyRef}
 style={{
 flex: 1,
 padding: "18px 20px",
 display: "flex",
 flexDirection: "column",
 gap: 14,
 overflowY: "auto",
 minHeight: 220,
 }}
 >
 {/* Active question - hide options while thinking so focus is on loader */}
 {!done && !thinking && flow[step] && (
 <>
 <ChipBubble>{flow[step].q}</ChipBubble>
 <QuickReplies
 options={flow[step].options}
 onPick={pick}
 disabled={thinking}
 />
 </>
 )}

 {/* ScrewIt page loader - between answers / before final line */}
 {thinking && (
 <div
 style={{
 borderRadius: "var(--radius-lg)",
 border: "1px solid var(--gray-100)",
 background: "var(--gray-50)",
 marginTop: 4,
 }}
 >
 <ThinkingLoader compact caption={thinkingCaption} />
 </div>
 )}

 {done && tier === "unserved" && (
 <ChipBubble>
 You&apos;re on the list - I&apos;ll reach out the moment
 we&apos;re live near you.
 </ChipBubble>
 )}
 {done && tier !== "unserved" && (
 <ChipBubble>
 All set. Here&apos;s where things stand - a real quote is one
 tap away.
 </ChipBubble>
 )}
 </div>

 <div
 style={{
 borderTop: "1px solid var(--gray-100)",
 padding: "16px 20px",
 background: "var(--gray-50)",
 }}
 >
 <div
 style={{
 display: "flex",
 alignItems: "center",
 justifyContent: "space-between",
 }}
 >
 <div
 style={{
 fontFamily: "var(--font-body)",
 fontSize: 12.5,
 fontWeight: 700,
 letterSpacing: "var(--tracking-caps)",
 textTransform: "uppercase",
 color: "var(--ink-300)",
 }}
 >
 Live estimate
 </div>
 {step > 0 && !thinking && (
 <button
 type="button"
 onClick={reset}
 style={{
 background: "none",
 border: "none",
 cursor: "pointer",
 fontFamily: "var(--font-body)",
 fontSize: 12.5,
 fontWeight: 600,
 color: "var(--blue-electric)",
 }}
 >
 Start over
 </button>
 )}
 </div>
 <div
 style={{
 display: "flex",
 justifyContent: "space-between",
 alignItems: "flex-start",
 gap: 12,
 marginTop: 8,
 }}
 >
 <div
 style={{
 fontFamily: "var(--font-body)",
 fontSize: 13.5,
 color: "var(--ink-700)",
 lineHeight: 1.4,
 }}
 >
 {thinking ? "Updating…" : bottomLine}
 </div>
 <div
 style={{
 fontFamily: "var(--font-display)",
 fontSize: 22,
 color: "var(--blue-deep)",
 flex: "none",
 }}
 >
 {thinking ? "…" : bottomPrice}
 </div>
 </div>
 {bottomCta && (
 <Button
 variant="primary"
 size="md"
 onClick={onCta}
 style={{ width: "100%", marginTop: 12 }}
 >
 {bottomCta}
 </Button>
 )}
 </div>
 </div>
 </>
 )}

 <div
 style={{
 position: "fixed",
 right: 28,
 bottom: 28,
 zIndex: 1100,
 display: "flex",
 flexDirection: "column",
 alignItems: "flex-end",
 gap: 12,
 }}
 >
 {greeted && (
 <button
 type="button"
 onClick={openChat}
 className={`screwit-greeting${open ? " dismissed" : ""}`}
 style={{
 display: "flex",
 alignItems: "center",
 gap: 10,
 background: "var(--white)",
 border: "1px solid var(--gray-200)",
 boxShadow: "var(--shadow-md)",
 borderRadius: "var(--radius-lg)",
 borderBottomRightRadius: 4,
 padding: "10px 16px",
 maxWidth: 240,
 fontFamily: "var(--font-body)",
 fontSize: 14,
 color: "var(--ink-900)",
 cursor: "pointer",
 textAlign: "left",
 }}
 >
 <Image
 src={ASSETS.mascot}
 alt=""
 width={30}
 height={30}
 style={{
 width: 30,
 height: 30,
 borderRadius: "50%",
 objectFit: "cover",
 objectPosition: "top",
 flex: "none",
 }}
 />
 Got a furniture situation? I&apos;m Chip.
 </button>
 )}

 <button
 type="button"
 onClick={toggle}
 aria-label={open ? "Close chat" : "Open chat"}
 className={`screwit-launcher${spin ? " spin" : ""}${seen ? " seen" : ""}`}
 >
 {!seen && (
 <span className="screwit-ping" aria-hidden="true">
 1
 </span>
 )}
 <Image
 key={spin ? "spinning" : "idle"}
 className="screwit-mark"
 src={ASSETS.logoS}
 alt=""
 width={34}
 height={34}
 style={
 spin
 ? {
 animation:
 "screwitSpin 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
 }
 : undefined
 }
 />
 </button>
 </div>
 </>
 );
}
