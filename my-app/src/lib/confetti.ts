/**
 * Waitlist success confetti — brand-colored dual-cannon burst.
 * Client-only; safe to call from effects.
 *
 * Note: this is a one-shot intentional celebration (not continuous UI motion).
 * We still fire when OS "Reduce motion" is on so the success moment is visible;
 * continuous/ambient animations elsewhere continue to respect reduced motion.
 */

const BRAND_COLORS = [
  "#04209b", // --blue-deep
  "#1d6efe", // --blue-electric
  "#4a87ff", // --blue-400
  "#b3ccff", // --blue-200
  "#ffffff",
  "#0e8a5f", // --status-success
];

type ConfettiFn = (options?: Record<string, unknown>) => Promise<null> | null;

async function loadConfetti(): Promise<ConfettiFn | null> {
  if (typeof window === "undefined") return null;
  try {
    const mod = await import("canvas-confetti");
    const confetti = (mod.default ?? mod) as ConfettiFn;
    return typeof confetti === "function" ? confetti : null;
  } catch (err) {
    console.warn("[confetti] failed to load canvas-confetti", err);
    return null;
  }
}

/**
 * Fire a short celebration for waitlist join success.
 * Dynamic-imports canvas-confetti so the form bundle stays light until success.
 */
export async function fireWaitlistConfetti(): Promise<void> {
  const confetti = await loadConfetti();
  if (!confetti) return;

  const defaults = {
    colors: BRAND_COLORS,
    // One-shot reward moment — do not suppress for reduced-motion OS setting
    disableForReducedMotion: false,
    zIndex: 10000,
    ticks: 220,
  };

  // Dual side cannons
  void confetti({
    ...defaults,
    particleCount: 90,
    spread: 70,
    startVelocity: 52,
    origin: { x: 0.1, y: 0.7 },
    angle: 60,
  });
  void confetti({
    ...defaults,
    particleCount: 90,
    spread: 70,
    startVelocity: 52,
    origin: { x: 0.9, y: 0.7 },
    angle: 120,
  });

  // Center pop for extra energy
  window.setTimeout(() => {
    void confetti({
      ...defaults,
      particleCount: 60,
      spread: 100,
      startVelocity: 38,
      origin: { x: 0.5, y: 0.45 },
      scalar: 1,
    });
  }, 160);
}
