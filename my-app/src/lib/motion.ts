import type { Transition, Variants } from "framer-motion";

/** Handoff motion: cubic-bezier(.16,1,.3,1) reveals, no bounce */
export const easeReveal: Transition["ease"] = [0.16, 1, 0.3, 1];
export const easeOut: Transition["ease"] = [0.2, 0.8, 0.2, 1];

export const duration = {
 fast: 0.12,
 base: 0.2,
 reveal: 0.64,
 menu: 0.34,
} as const;

export const viewportOnce = {
 once: true,
 amount: 0.08,
 // Slight bottom inset only - avoid aggressive margins that block IO
 margin: "0px 0px -5% 0px" as const,
};

/** Section fade-and-lift (matches handoff .reveal) */
export const sectionReveal: Variants = {
 hidden: { opacity: 0, y: 26 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: duration.reveal, ease: easeReveal },
 },
};

export const fadeUp: Variants = {
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.5, ease: easeReveal },
 },
};

export const staggerContainer: Variants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.07, delayChildren: 0.04 },
 },
};

export const staggerItem: Variants = {
 hidden: { opacity: 0, y: 14 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.45, ease: easeReveal },
 },
};

export const dropdownPanel: Variants = {
 hidden: { opacity: 0, y: -6 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: duration.base, ease: easeOut },
 },
 exit: {
 opacity: 0,
 y: -4,
 transition: { duration: 0.12 },
 },
};

export const collapse: Variants = {
 hidden: { height: 0, opacity: 0 },
 visible: {
 height: "auto",
 opacity: 1,
 transition: { duration: 0.3, ease: "easeInOut" },
 },
 exit: {
 height: 0,
 opacity: 0,
 transition: { duration: 0.25, ease: "easeInOut" },
 },
};

export const drawerVariants: Variants = {
 closed: { x: "100%" },
 open: {
 x: 0,
 transition: { duration: duration.menu, ease: easeReveal },
 },
};
