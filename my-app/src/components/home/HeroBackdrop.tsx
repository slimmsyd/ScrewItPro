"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { easeReveal } from "@/lib/motion";
import { useMotionMode, type MotionMode } from "@/hooks/useMotionMode";

/**
 * Hero backdrop - wireframe furniture line art (design handoff default).
 * Animated for character: blueprint draw-on + ambient float + slow screws.
 * Side SVGs hide below 1180px; mobile/tablet get the blueprint grid + veil.
 * Respects prefers-reduced-motion (static art).
 */
export type HeroBgVariant = "wireframe" | "blueprint" | "exploded" | "arcs";

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

function Veil() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(ellipse 62% 58% at 50% 40%, var(--white) 30%, rgba(255,255,255,.72) 58%, rgba(255,255,255,0) 82%)",
      }}
    />
  );
}

function BlueprintGrid({ animate }: { animate: boolean }) {
  return (
    <div
      aria-hidden
      className={animate ? "hero-blueprint-grid is-animated" : "hero-blueprint-grid"}
      style={{
        position: "absolute",
        inset: "-28px",
        backgroundImage:
          "linear-gradient(rgba(29,110,254,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(29,110,254,.055) 1px, transparent 1px), linear-gradient(rgba(29,110,254,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(29,110,254,.10) 1px, transparent 1px)",
        backgroundSize: "28px 28px, 28px 28px, 140px 140px, 140px 140px",
      }}
    />
  );
}

function DrawPath({
  d,
  delay = 0,
  reduce,
  stroke,
  strokeDasharray,
}: {
  d: string;
  delay?: number;
  reduce: boolean;
  stroke?: string;
  strokeDasharray?: string;
}) {
  if (reduce) {
    return (
      <path d={d} stroke={stroke} strokeDasharray={strokeDasharray} />
    );
  }
  return (
    <motion.path
      d={d}
      stroke={stroke}
      strokeDasharray={strokeDasharray}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 1.15, delay, ease: easeReveal },
        opacity: { duration: 0.28, delay },
      }}
    />
  );
}

function DrawCircle({
  cx,
  cy,
  r,
  delay = 0,
  reduce,
}: {
  cx: number;
  cy: number;
  r: number;
  delay?: number;
  reduce: boolean;
}) {
  if (reduce) return <circle cx={cx} cy={cy} r={r} />;
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={r}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { duration: 0.7, delay, ease: easeReveal },
        opacity: { duration: 0.25, delay },
      }}
    />
  );
}

function FadeIn({
  children,
  delay = 0,
  reduce,
}: {
  children: ReactNode;
  delay?: number;
  reduce: boolean;
}) {
  if (reduce) return <>{children}</>;
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, delay, ease: easeReveal }}
    >
      {children}
    </motion.g>
  );
}

function Crosses({
  pts,
  delay = 0,
  reduce,
}: {
  pts: [number, number][];
  delay?: number;
  reduce: boolean;
}) {
  return (
    <>
      {pts.map(([x, y], i) => (
        <DrawPath
          key={`${x}-${y}`}
          d={`M${x - 6},${y} H${x + 6} M${x},${y - 6} V${y + 6}`}
          stroke="var(--blue-100)"
          delay={delay + i * 0.08}
          reduce={reduce}
        />
      ))}
    </>
  );
}

/**
 * Screws / dowels: pure SVG placement + SMIL/CSS - NOT Framer CSS transforms.
 * Framer's style.transformOrigin on <g> (incl. template strings like `${x}px`)
 * pivots against the wrong box and makes scale/rotate look broken.
 */
function Screw({
  x,
  y,
  delay = 0,
  reduce,
}: {
  x: number;
  y: number;
  delay?: number;
  reduce: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g
        className={reduce ? undefined : "hero-screw"}
        style={
          reduce
            ? undefined
            : ({ ["--hero-delay"]: `${delay}s` } as CSSProperties)
        }
      >
        {/* Spin around local 0,0 via SMIL - reliable on SVG */}
        {!reduce && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 0 0"
            to="360 0 0"
            dur="16s"
            begin={`${delay + 0.4}s`}
            repeatCount="indefinite"
          />
        )}
        <circle cx={0} cy={0} r={7} />
        <path d="M-4,-4 L4,4" />
      </g>
    </g>
  );
}

function Dowel({
  x,
  y,
  rot,
  delay,
  reduce,
}: {
  x: number;
  y: number;
  rot: number;
  delay: number;
  reduce: boolean;
}) {
  // Place at rect center, then rotate - no CSS transform-origin math
  const cx = x + 11;
  const cy = y + 3.5;

  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rot})`}>
      <g
        className={reduce ? undefined : "hero-dowel"}
        style={
          reduce
            ? undefined
            : ({ ["--hero-delay"]: `${delay}s` } as CSSProperties)
        }
      >
        {!reduce && (
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0 0; 0 -3; 0 0; 0 2; 0 0"
            keyTimes="0; 0.25; 0.5; 0.75; 1"
            dur="6s"
            begin={`${delay + 0.55}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
          />
        )}
        <rect x={-11} y={-3.5} width={22} height={7} rx={3.5} />
      </g>
    </g>
  );
}

function ArtSide({
  side,
  children,
  mode,
}: {
  side: "l" | "r";
  children: ReactNode;
  mode: MotionMode;
}) {
  const enterX = side === "l" ? -36 : 36;
  const floatY = side === "l" ? [0, -7, 0] : [0, 6, 0];
  const delay = side === "r" ? 0.12 : 0;

  const innerGroup = (
    <g
      fill="none"
      stroke="var(--blue-200)"
      strokeWidth="1.5"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {children}
    </g>
  );

  // Server + first client render: static, no motion attributes (hydration-safe).
  if (mode === "static") {
    return (
      <svg
        className={`hero-art hero-art-${side}`}
        width={360}
        viewBox="0 0 360 700"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        style={{ height: "100%" }}
      >
        {innerGroup}
      </svg>
    );
  }

  // Reduced motion: soft opacity fade of the whole panel, no transforms/float.
  if (mode === "soft") {
    return (
      <motion.svg
        className={`hero-art hero-art-${side}`}
        width={360}
        viewBox="0 0 360 700"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        style={{ height: "100%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: easeReveal, delay }}
      >
        {innerGroup}
      </motion.svg>
    );
  }

  return (
    <motion.svg
      className={`hero-art hero-art-${side}`}
      width={360}
      viewBox="0 0 360 700"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      style={{ height: "100%" }}
      initial={{ opacity: 0, x: enterX, y: 18 }}
      animate={{
        opacity: 1,
        x: 0,
        y: floatY,
      }}
      transition={{
        opacity: { duration: 0.9, ease: easeReveal, delay },
        x: { duration: 0.9, ease: easeReveal, delay },
        y: {
          duration: side === "l" ? 7.2 : 8.4,
          delay: delay + 0.95,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {innerGroup}
    </motion.svg>
  );
}

function WireframeArt({ mode }: { mode: MotionMode }) {
  const reduce = mode !== "full";
  return (
    <>
      <ArtSide side="l" mode={mode}>
        {/* bookcase (iso) - draw sequence top → shelves */}
        <DrawPath d="M40,120 H210 V440 H40 Z" delay={0.15} reduce={reduce} />
        <DrawPath d="M40,120 L84,94 H254 L210,120" delay={0.28} reduce={reduce} />
        <DrawPath d="M210,120 L254,94 V414 L210,440" delay={0.38} reduce={reduce} />
        <DrawPath d="M40,205 H210 M40,290 H210 M40,375 H210" delay={0.5} reduce={reduce} />
        <DrawPath
          d="M210,205 L254,179 M210,290 L254,264 M210,375 L254,349"
          delay={0.58}
          reduce={reduce}
        />
        <DrawPath
          d="M282,120 H298 M282,440 H298 M290,120 V440"
          stroke="var(--blue-100)"
          delay={0.68}
          reduce={reduce}
        />
        <FadeIn delay={0.95} reduce={reduce}>
          <text
            x="306"
            y="284"
            fontFamily={MONO}
            fontSize="11"
            fill="var(--blue-300)"
            stroke="none"
          >
            62 in
          </text>
        </FadeIn>
        {/* dresser */}
        <DrawPath d="M0,560 H180 V690 H0 Z M0,625 H180" delay={0.55} reduce={reduce} />
        <DrawPath d="M180,560 L216,536 V666 L180,690" delay={0.65} reduce={reduce} />
        <DrawCircle cx={70} cy={592} r={4} delay={0.78} reduce={reduce} />
        <DrawCircle cx={110} cy={592} r={4} delay={0.82} reduce={reduce} />
        <DrawCircle cx={70} cy={658} r={4} delay={0.86} reduce={reduce} />
        <DrawCircle cx={110} cy={658} r={4} delay={0.9} reduce={reduce} />
        <Screw x={300} y={60} delay={0.7} reduce={reduce} />
        <Dowel x={150} y={38} rot={24} delay={0.55} reduce={reduce} />
        <Crosses pts={[[260, 520], [86, 60]]} delay={0.85} reduce={reduce} />
      </ArtSide>
      <ArtSide side="r" mode={mode}>
        {/* chair (iso) */}
        <DrawPath
          d="M130,210 V466 M230,210 V466 M130,210 H230 M130,240 H230"
          delay={0.25}
          reduce={reduce}
        />
        <DrawPath
          d="M94,380 H194 M94,380 L130,356 M194,380 L230,356 M130,356 H230"
          delay={0.4}
          reduce={reduce}
        />
        <DrawPath d="M94,380 V490 M194,380 V490" delay={0.5} reduce={reduce} />
        <DrawPath
          d="M94,506 V522 M230,506 V522 M94,514 H230"
          stroke="var(--blue-100)"
          delay={0.58}
          reduce={reduce}
        />
        <FadeIn delay={0.95} reduce={reduce}>
          <text
            x="140"
            y="500"
            fontFamily={MONO}
            fontSize="11"
            fill="var(--blue-300)"
            stroke="none"
          >
            34 in
          </text>
        </FadeIn>
        {/* pendant lamp - slight sway via group */}
        {/* Outer translate fixed; inner g holds SMIL rotate so they don't clobber each other */}
        <g transform="translate(320 0)">
          <g
            className={reduce ? undefined : "hero-lamp"}
            style={
              reduce
                ? undefined
                : ({ ["--hero-delay"]: "0.55s" } as CSSProperties)
            }
          >
            {!reduce && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-4 0 0; 4 0 0; -4 0 0"
                keyTimes="0; 0.5; 1"
                dur="5.5s"
                begin="1.1s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
              />
            )}
            <path d="M0,0 V88 M-26,88 H26 L12,126 H-12 Z" />
            <circle cx={0} cy={138} r={8} />
          </g>
        </g>
        <Screw x={60} y={600} delay={0.75} reduce={reduce} />
        <Dowel x={228} y={618} rot={-18} delay={0.7} reduce={reduce} />
        <Crosses pts={[[40, 160], [300, 560]]} delay={0.9} reduce={reduce} />
      </ArtSide>
      <Veil />
    </>
  );
}

function ExplodedArt({ mode }: { mode: MotionMode }) {
  const reduce = mode !== "full";
  return (
    <>
      <ArtSide side="l" mode={mode}>
        <Dowel x={48} y={136} rot={-16} delay={0.2} reduce={reduce} />
        <Dowel x={88} y={166} rot={12} delay={0.32} reduce={reduce} />
        <Dowel x={54} y={192} rot={-4} delay={0.44} reduce={reduce} />
        <FadeIn delay={0.7} reduce={reduce}>
          <text
            x="46"
            y="232"
            fontFamily={MONO}
            fontSize="11"
            fill="var(--blue-300)"
            stroke="none"
          >
            dowel ×12
          </text>
        </FadeIn>
        <Screw x={120} y={420} delay={0.55} reduce={reduce} />
        <Screw x={160} y={450} delay={0.65} reduce={reduce} />
        <FadeIn delay={0.85} reduce={reduce}>
          <text
            x="106"
            y="488"
            fontFamily={MONO}
            fontSize="11"
            fill="var(--blue-300)"
            stroke="none"
          >
            M6 ×4
          </text>
        </FadeIn>
        <DrawPath d="M80,560 h46 v13 h-33 v34 h-13 Z" delay={0.5} reduce={reduce} />
        <Crosses
          pts={[
            [240, 300],
            [60, 60],
            [200, 640],
          ]}
          delay={0.75}
          reduce={reduce}
        />
      </ArtSide>
      <ArtSide side="r" mode={mode}>
        <DrawPath
          d="M180,40 V660"
          stroke="var(--blue-100)"
          strokeDasharray="4 9"
          delay={0.2}
          reduce={reduce}
        />
        <Screw x={150} y={60} delay={0.35} reduce={reduce} />
        <Screw x={210} y={60} delay={0.45} reduce={reduce} />
        <FadeIn delay={0.65} reduce={reduce}>
          <text
            x="236"
            y="64"
            fontFamily={MONO}
            fontSize="11"
            fill="var(--blue-300)"
            stroke="none"
          >
            M4 ×8
          </text>
        </FadeIn>
        <DrawPath d="M90,120 L130,94 H270 L230,120 Z" delay={0.3} reduce={reduce} />
        <DrawPath d="M90,210 H230 V430 H90 Z" delay={0.42} reduce={reduce} />
        <DrawPath d="M230,210 L270,184 V404 L230,430" delay={0.5} reduce={reduce} />
        <DrawPath d="M90,210 L130,184 H270" delay={0.55} reduce={reduce} />
        <DrawPath d="M90,320 H230 M230,320 L270,294" delay={0.62} reduce={reduce} />
        <DrawPath d="M90,500 L130,474 H270 L230,500 Z" delay={0.7} reduce={reduce} />
        <DrawCircle cx={40} cy={110} r={12} delay={0.4} reduce={reduce} />
        <FadeIn delay={0.75} reduce={reduce}>
          <text
            x="36"
            y="114"
            fontFamily={MONO}
            fontSize="11"
            fill="var(--blue-300)"
            stroke="none"
          >
            A
          </text>
        </FadeIn>
        <DrawPath
          d="M52,110 H86"
          stroke="var(--blue-100)"
          strokeDasharray="3 6"
          delay={0.8}
          reduce={reduce}
        />
        <Crosses pts={[[320, 340], [60, 660]]} delay={0.85} reduce={reduce} />
      </ArtSide>
      <Veil />
    </>
  );
}

function Arcs({ mode }: { mode: MotionMode }) {
  if (mode === "static") {
    return (
      <>
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 220,
            height: 220,
            background: "var(--blue-50)",
            borderBottomLeftRadius: "100%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 200,
            height: 200,
            background: "var(--blue-50)",
            borderTopRightRadius: "100%",
          }}
        />
      </>
    );
  }

  // Reduced motion: fade only (no scale).
  const soft = mode === "soft";

  return (
    <>
      <motion.div
        initial={soft ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
        animate={soft ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: easeReveal }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 220,
          height: 220,
          background: "var(--blue-50)",
          borderBottomLeftRadius: "100%",
          transformOrigin: "100% 0%",
        }}
      />
      <motion.div
        initial={soft ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
        animate={soft ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: easeReveal }}
        style={{
          position: "absolute",
          bottom: -60,
          left: -60,
          width: 200,
          height: 200,
          background: "var(--blue-50)",
          borderTopRightRadius: "100%",
          transformOrigin: "0% 100%",
        }}
      />
    </>
  );
}

export default function HeroBackdrop({
  variant = "wireframe",
  mobile = false,
}: {
  variant?: HeroBgVariant;
  mobile?: boolean;
}) {
  const mode = useMotionMode();
  const reduce = mode !== "full";

  if (variant === "arcs") {
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <Arcs mode={mode} />
      </div>
    );
  }

  if (variant === "blueprint" || mobile) {
    return (
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <BlueprintGrid animate={!reduce} />
        <Veil />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {variant === "exploded" ? (
        <ExplodedArt mode={mode} />
      ) : (
        <WireframeArt mode={mode} />
      )}
    </div>
  );
}
