"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  PartyPopper,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { CustomerOrderStatus } from "@/lib/orders";
import {
  ORDER_STATUS_META,
  ORDER_STATUS_ORDER,
  formatUpdatedAgo,
  nodeStateFor,
} from "@/lib/orders";

const ICONS: Record<string, LucideIcon> = {
  CheckCircle2,
  CalendarCheck,
  PackageCheck,
  Wrench,
  ClipboardCheck,
  Truck,
  PartyPopper,
};

/**
 * Icons that draw their own circle read as a warped double ring inside a node
 * that already draws one. Swap in the bare glyph and let the node be the circle.
 */
const GLYPH_IN_RING: Partial<Record<string, LucideIcon>> = {
  CheckCircle2: Check,
};

/** Node geometry — one source so ring, pulse, and connector stay in step. */
const NODE_SIZE = 34;
const GLYPH_SIZE = 16;

/** Ripple cadence for the in-progress node (seconds). */
const PULSE_DURATION = 2;
const PULSE_COUNT = 2;
/** Kept modest — a ripple wider than this collides with the neighbouring row. */
const PULSE_SCALE = 1.75;

/**
 * Expanding rings behind the active timeline icon — "we are still on this step".
 * Rendered only for the in-progress node, never for a terminal state.
 * Silent under prefers-reduced-motion (rings stay at CSS opacity 0).
 */
function ActiveNodePulse() {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const rings = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll("[data-pulse-ring]")
    );
    if (!rings.length) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      rings.forEach((ring, i) => {
        gsap.fromTo(
          ring,
          { scale: 1, opacity: 0.45 },
          {
            scale: PULSE_SCALE,
            opacity: 0,
            duration: PULSE_DURATION,
            ease: "power2.out",
            repeat: -1,
            // Evenly offset each ring so the ripple reads as a steady cadence.
            delay: (i * PULSE_DURATION) / rings.length,
            // Delayed rings must stay hidden until their first run.
            immediateRender: i === 0,
          }
        );
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <span ref={rootRef} aria-hidden>
      {Array.from({ length: PULSE_COUNT }).map((_, i) => (
        <span
          key={i}
          data-pulse-ring
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            // 1.5px reads as ~2.6px once scaled up — matches the node ring.
            border: "1.5px solid var(--blue-electric)",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
      ))}
    </span>
  );
}

export default function OrderTimeline({
  current,
  statusUpdatedAt,
}: {
  current: CustomerOrderStatus;
  statusUpdatedAt: string;
}) {
  const updated = formatUpdatedAgo(statusUpdatedAt);

  return (
    <ol
      style={{
        listStyle: "none",
        margin: "28px 0 0",
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {ORDER_STATUS_ORDER.map((step, i) => {
        const state = nodeStateFor(step, current);
        const meta = ORDER_STATUS_META[step];
        const Icon = GLYPH_IN_RING[meta.icon] ?? ICONS[meta.icon] ?? Check;
        const isLast = i === ORDER_STATUS_ORDER.length - 1;
        // Delivered is terminal — it reads as "active" but nothing is in flight.
        const isPulsing = state === "active" && step !== "delivered";

        return (
          <li
            key={step}
            aria-current={state === "active" ? "step" : undefined}
            style={{
              display: "flex",
              gap: 16,
              position: "relative",
              minHeight: isLast ? undefined : 64,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 34,
                flex: "0 0 34px",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  flex: `0 0 ${NODE_SIZE}px`,
                  position: "relative",
                  border: "none",
                  background:
                    state === "done"
                      ? "var(--blue-electric)"
                      : state === "active"
                        ? "#fff"
                        : "var(--gray-50)",
                  /**
                   * Rings are inset shadows, not borders: a border changes the
                   * content box per state and nudges the glyph half a pixel as
                   * the order advances. Active also gets a soft halo so it still
                   * reads as current when the pulse is off (reduced motion).
                   */
                  boxShadow:
                    state === "done"
                      ? "none"
                      : state === "active"
                        ? "inset 0 0 0 2px var(--blue-electric), 0 0 0 4px rgba(29, 110, 254, 0.10)"
                        : "inset 0 0 0 1.5px var(--gray-100)",
                }}
              >
                {isPulsing && <ActiveNodePulse />}
                {state === "done" ? (
                  <Check size={GLYPH_SIZE} color="#fff" strokeWidth={2.4} />
                ) : (
                  <Icon
                    size={GLYPH_SIZE}
                    color={
                      state === "active"
                        ? "var(--blue-electric)"
                        : "var(--ink-300)"
                    }
                    strokeWidth={2.2}
                  />
                )}
              </div>
              {!isLast && (
                <div
                  aria-hidden
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 22,
                    // Clears the active node's 4px halo before the line starts.
                    marginTop: state === "active" ? 8 : 4,
                    /**
                     * Travelled track is solid; the leg leaving the current step
                     * fades out to say "this is where progress stops today".
                     */
                    background:
                      state === "done"
                        ? "var(--blue-electric)"
                        : state === "active"
                          ? "linear-gradient(var(--blue-electric), var(--gray-100))"
                          : "var(--gray-100)",
                    borderRadius: 1,
                  }}
                />
              )}
            </div>

            <div style={{ paddingBottom: isLast ? 0 : 18, minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15.5,
                  fontWeight: state === "active" ? 800 : state === "done" ? 700 : 600,
                  color:
                    state === "upcoming"
                      ? "var(--ink-300)"
                      : "var(--blue-deep)",
                  lineHeight: 1.25,
                }}
              >
                {meta.label}
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontFamily: "var(--font-body)",
                  fontSize: 13.5,
                  color:
                    state === "upcoming"
                      ? "var(--ink-300)"
                      : "var(--ink-500)",
                  lineHeight: 1.4,
                }}
              >
                {meta.description}
              </div>
              {state === "active" && (
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--blue-electric)",
                  }}
                >
                  In progress · updated {updated}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
