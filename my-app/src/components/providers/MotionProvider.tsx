"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * App-wide Framer Motion config.
 * Respects prefers-reduced-motion from the OS/browser.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
