"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type MotionMode = "full" | "soft" | "static";

/**
 * SSR-safe motion mode.
 *
 * `useReducedMotion()` returns null on the server and the real OS preference on
 * the client, so branching on it directly makes the server and first client
 * render disagree -> hydration mismatch. This gates on a mount flag instead:
 *
 *  - "static" — server + first client render (identical HTML, no mismatch)
 *  - "full"   — after mount, user allows motion (draw-on, float, spin)
 *  - "soft"   — after mount, user prefers reduced motion (opacity fade only)
 *
 * "soft" still gives reduced-motion users a gentle fade-in instead of nothing,
 * while keeping transforms/looping motion off for accessibility.
 */
export function useMotionMode(): MotionMode {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return "static";
  return prefersReduced ? "soft" : "full";
}
