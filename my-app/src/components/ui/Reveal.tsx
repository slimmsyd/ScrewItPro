"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { duration, easeReveal } from "@/lib/motion";

/**
 * Subtle scroll lift for sections.
 * Never animates opacity to 0 - content is always fully visible.
 * (Previous whileInView + opacity:0 left mid-page sections blank.)
 */
export default function Reveal({
 children,
 className,
 as = "div",
 id,
 style,
}: {
 children: ReactNode;
 className?: string;
 as?: "div" | "section" | "footer" | "header";
 id?: string;
 style?: React.CSSProperties;
}) {
 const ref = useRef<HTMLElement | null>(null);
 const reduce = useReducedMotion();
 const inView = useInView(ref, {
 once: true,
 amount: 0.12,
 margin: "0px 0px -40px 0px",
 });

 const Comp = motion[as];

 return (
 <Comp
 ref={ref as never}
 id={id}
 className={className}
 data-reveal=""
 style={{
 // Hard guarantee: never invisible even if motion state glitches
 opacity: 1,
 ...style,
 }}
 initial={reduce ? false : { y: 18 }}
 animate={reduce || inView ? { y: 0 } : { y: 18 }}
 transition={{
 duration: reduce ? 0 : duration.reveal,
 ease: easeReveal,
 }}
 >
 {children}
 </Comp>
 );
}
