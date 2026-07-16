"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Truck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";

type Step = { title: string; body: string };

/** Original snaking connector through the four step columns. */
const FLOW_PATH =
  "M0 6 H232 Q250 6 250 24 V46 Q250 64 268 64 H482 Q500 64 500 46 V24 Q500 6 518 6 H732 Q750 6 750 24 V46 Q750 64 768 64 H1000";

/**
 * Live scroll progress of `el` through the viewport.
 *
 * Why not GSAP ScrollTrigger for this?
 * Landing splash sets body { overflow: hidden } for ~3.5s. ScrollTrigger
 * caches start/end during that window and never re-observes entry correctly
 * on mobile. getBoundingClientRect is re-read every frame → always correct.
 *
 * progress 0 = section top near bottom of viewport (entering)
 * progress 1 = section bottom near top of viewport (leaving)
 */
function readScrollProgress(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  // Start drawing when section top hits ~90% down the screen
  const startLine = vh * 0.9;
  // Finish when section bottom hits ~25% down the screen
  const endLine = vh * 0.25;
  const distance = rect.height + (startLine - endLine);
  if (distance <= 0) return 0;
  const traveled = startLine - rect.top;
  return Math.max(0, Math.min(1, traveled / distance));
}

function Bubble({
  i,
  reached,
  reduce,
}: {
  i: number;
  reached: boolean;
  reduce: boolean;
}) {
  return (
    <motion.div
      style={{
        flex: "none",
        width: 48,
        height: 48,
        borderRadius: "50%",
        position: "relative",
        zIndex: 2,
        background:
          "linear-gradient(135deg, var(--blue-electric), var(--blue-deep))",
        opacity: reduce || reached ? 1 : 0.42,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px -8px rgba(29,110,254,0.7)",
      }}
      initial={false}
      animate={reduce ? { scale: 1 } : { scale: reached ? 1.05 : 0.96 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--white)",
        }}
      >
        {i + 1}
      </span>
    </motion.div>
  );
}

/**
 * Four-step flow.
 * Desktop: original snaking path + van; path draws from live scroll progress.
 * Mobile: vertical rail fills from the same live progress (follows the user).
 * GSAP: only for smooth property writes (path dash / fill / van).
 * Framer: bubble springs.
 */
export default function StepFlow({ steps }: { steps: Step[] }) {
  const reduce = useReducedMotion() ?? false;
  const n = steps.length;
  const gradId = useId().replace(/:/g, "");

  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const vanRef = useRef<HTMLDivElement>(null);
  const pathLenRef = useRef(0);
  const progressRef = useRef(0);

  // Hydration-safe mobile flag
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    setReady(true);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Measure path length when desktop path mounts
  useEffect(() => {
    if (!ready || isMobile || !pathRef.current) return;
    pathLenRef.current = pathRef.current.getTotalLength();
    gsap.set(pathRef.current, {
      strokeDasharray: pathLenRef.current,
      strokeDashoffset: reduce ? 0 : pathLenRef.current,
    });
  }, [ready, isMobile, reduce]);

  // Live scroll observation — re-reads layout every frame
  useEffect(() => {
    if (!ready) return;

    let raf = 0;

    const applyProgress = (p: number) => {
      progressRef.current = p;
      setProgress(p);

      if (reduce) {
        if (pathRef.current && pathLenRef.current) {
          gsap.set(pathRef.current, { strokeDashoffset: 0 });
        }
        if (fillRef.current) {
          gsap.set(fillRef.current, { scaleY: 1 });
        }
        if (vanRef.current) {
          gsap.set(vanRef.current, { left: "100%", top: 42 });
        }
        return;
      }

      // Mobile fill
      if (fillRef.current) {
        gsap.set(fillRef.current, {
          scaleY: p,
          transformOrigin: "50% 0%",
        });
      }

      // Desktop path draw
      if (pathRef.current && pathLenRef.current) {
        gsap.set(pathRef.current, {
          strokeDashoffset: pathLenRef.current * (1 - p),
        });
      }

      // Desktop van keyframes along original route
      if (vanRef.current) {
        let left = 0;
        let top = -16;
        if (p < 0.38) {
          const t = p / 0.38;
          left = 0 + 38 * t;
          top = -16 + 58 * t;
        } else if (p < 0.63) {
          const t = (p - 0.38) / 0.25;
          left = 38 + 25 * t;
          top = 42 - 58 * t;
        } else {
          const t = (p - 0.63) / 0.37;
          left = 63 + 37 * t;
          top = -16 + 58 * t;
        }
        gsap.set(vanRef.current, { left: `${left}%`, top });
      }
    };

    const tick = () => {
      raf = 0;
      // Observe the How section if present, else this root
      const el =
        (rootRef.current?.closest("#how") as HTMLElement | null) ??
        rootRef.current;
      if (!el) return;
      applyProgress(reduce ? 1 : readScrollProgress(el));
    };

    const onScrollOrResize = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(tick);
    };

    // Run immediately + after splash unlocks body scroll
    tick();
    const t1 = window.setTimeout(tick, 400);
    const t2 = window.setTimeout(tick, 1200);
    const t3 = window.setTimeout(tick, 3600); // after ~3.5s splash
    const t4 = window.setTimeout(tick, 4500);

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    window.addEventListener("orientationchange", onScrollOrResize);

    // Also watch body style changes (splash clears overflow)
    const bodyObs = new MutationObserver(onScrollOrResize);
    bodyObs.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("orientationchange", onScrollOrResize);
      bodyObs.disconnect();
    };
  }, [ready, isMobile, reduce, n]);

  const reached = (i: number) => {
    if (reduce) return true;
    if (n <= 1) return progress > 0.08;
    return progress >= i / (n - 1) - 0.04;
  };

  if (!ready) {
    return <div style={{ minHeight: 280 }} aria-hidden />;
  }

  /* ── Mobile ── */
  if (isMobile) {
    return (
      <div
        ref={rootRef}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 28,
          paddingBottom: 8,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 23,
            top: 24,
            bottom: 24,
            width: 3,
            borderRadius: 999,
            background: "var(--blue-100)",
            overflow: "hidden",
            zIndex: 0,
          }}
        >
          <div
            ref={fillRef}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: "100%",
              borderRadius: 999,
              background:
                "linear-gradient(180deg, var(--blue-electric), var(--blue-deep))",
              transform: "scaleY(0)",
              transformOrigin: "50% 0%",
              willChange: "transform",
            }}
          />
        </div>

        {steps.map((s, i) => (
          <div
            key={s.title}
            style={{
              position: "relative",
              display: "flex",
              gap: 18,
              alignItems: "flex-start",
              zIndex: 1,
            }}
          >
            <Bubble i={i} reached={reached(i)} reduce={reduce} />
            <div style={{ paddingTop: 2 }}>
              <h4
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 19,
                  fontWeight: 700,
                  color: "var(--text-heading)",
                  margin: "0 0 6px",
                }}
              >
                {s.title}
              </h4>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15.5,
                  lineHeight: "var(--leading-body)",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Desktop: original snaking layout ── */
  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        marginTop: "15%",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "11%",
          right: "11%",
          top: 6,
          height: 70,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg
          viewBox="0 0 1000 70"
          preserveAspectRatio="none"
          width="100%"
          height="70"
          fill="none"
        >
          <defs>
            <linearGradient
              id={gradId}
              x1="0"
              y1="0"
              x2="1000"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--blue-electric)" stopOpacity="0" />
              <stop offset="0.85" stopColor="var(--blue-electric)" />
            </linearGradient>
          </defs>
          <path
            d={FLOW_PATH}
            stroke="var(--blue-100)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            ref={pathRef}
            d={FLOW_PATH}
            stroke={`url(#${gradId})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
          />
        </svg>
        {!reduce && (
          <div
            ref={vanRef}
            style={{
              position: "absolute",
              top: -16,
              left: 0,
              transform: "translateX(-50%)",
              zIndex: 2,
              willChange: "left, top",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--white)",
                border: "1px solid var(--blue-100)",
                boxShadow: "0 8px 22px -6px rgba(11,16,48,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Truck size={22} color="var(--blue-electric)" aria-hidden />
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${n}, 1fr)`,
          gap: 28,
          position: "relative",
          zIndex: 1,
          paddingTop: 12,
        }}
      >
        {steps.map((s, i) => (
          <div key={s.title}>
            <div style={{ marginBottom: 20 }}>
              <Bubble i={i} reached={reached(i)} reduce={reduce} />
            </div>
            <h4
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 21,
                fontWeight: 700,
                color: "var(--text-heading)",
                margin: "0 0 10px",
              }}
            >
              {s.title}
            </h4>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15.5,
                lineHeight: "var(--leading-body)",
                color: "var(--text-muted)",
                margin: 0,
                maxWidth: "30ch",
              }}
            >
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
