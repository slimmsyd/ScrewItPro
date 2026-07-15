"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

export type MotionMode = "full" | "soft" | "static";

const noopSubscribe = () => () => {};

/** True after hydration, false on the server and first client render. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

/**
 * SSR-safe motion mode.
 *
 * `useReducedMotion()` returns null on the server and the real OS preference on
 * the client, so branching on it directly makes the server and first client
 * render disagree -> hydration mismatch. Gating on hydration avoids that:
 *
 *  - "static" - server + first client render (identical HTML, no mismatch)
 *  - "full"   - after hydration, user allows motion (draw-on, float, spin)
 *  - "soft"   - after hydration, user prefers reduced motion (opacity fade only)
 *
 * "soft" still gives reduced-motion users a gentle fade-in instead of nothing,
 * while keeping transforms/looping motion off for accessibility.
 */
export function useMotionMode(): MotionMode {
  const prefersReduced = useReducedMotion();
  const hydrated = useHydrated();

  if (!hydrated) return "static";
  return prefersReduced ? "soft" : "full";
}
