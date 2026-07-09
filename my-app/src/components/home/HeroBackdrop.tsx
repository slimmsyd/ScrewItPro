import type { ReactNode } from "react";

/**
 * Hero backdrop — wireframe furniture line art (design handoff default).
 * Side SVGs hide below 1180px; mobile/tablet get the blueprint grid + veil.
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

function BlueprintGrid() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage:
          "linear-gradient(rgba(29,110,254,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(29,110,254,.055) 1px, transparent 1px), linear-gradient(rgba(29,110,254,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(29,110,254,.10) 1px, transparent 1px)",
        backgroundSize: "28px 28px, 28px 28px, 140px 140px, 140px 140px",
      }}
    />
  );
}

function crosses(pts: [number, number][]) {
  return pts.map(([x, y], i) => (
    <path
      key={i}
      d={`M${x - 6},${y} H${x + 6} M${x},${y - 6} V${y + 6}`}
      stroke="var(--blue-100)"
    />
  ));
}

function screw(x: number, y: number) {
  return (
    <g key={`s${x}${y}`}>
      <circle cx={x} cy={y} r="7" />
      <path d={`M${x - 4},${y - 4} L${x + 4},${y + 4}`} />
    </g>
  );
}

function ArtSide({
  side,
  children,
}: {
  side: "l" | "r";
  children: ReactNode;
}) {
  return (
    <svg
      className={`hero-art hero-art-${side}`}
      width={360}
      viewBox="0 0 360 700"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      style={{ height: "100%" }}
    >
      <g
        fill="none"
        stroke="var(--blue-200)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {children}
      </g>
    </svg>
  );
}

function WireframeArt() {
  return (
    <>
      <ArtSide side="l">
        {/* bookcase (iso) */}
        <path d="M40,120 H210 V440 H40 Z" />
        <path d="M40,120 L84,94 H254 L210,120" />
        <path d="M210,120 L254,94 V414 L210,440" />
        <path d="M40,205 H210 M40,290 H210 M40,375 H210" />
        <path d="M210,205 L254,179 M210,290 L254,264 M210,375 L254,349" />
        <path
          d="M282,120 H298 M282,440 H298 M290,120 V440"
          stroke="var(--blue-100)"
        />
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
        {/* dresser cropped at the fold */}
        <path d="M0,560 H180 V690 H0 Z M0,625 H180" />
        <path d="M180,560 L216,536 V666 L180,690" />
        <circle cx="70" cy="592" r="4" />
        <circle cx="110" cy="592" r="4" />
        <circle cx="70" cy="658" r="4" />
        <circle cx="110" cy="658" r="4" />
        {screw(300, 60)}
        <rect
          x="150"
          y="38"
          width="22"
          height="7"
          rx="3.5"
          transform="rotate(24 161 41)"
        />
        {crosses([
          [260, 520],
          [86, 60],
        ])}
      </ArtSide>
      <ArtSide side="r">
        {/* chair (iso) */}
        <path d="M130,210 V466 M230,210 V466 M130,210 H230 M130,240 H230" />
        <path d="M94,380 H194 M94,380 L130,356 M194,380 L230,356 M130,356 H230" />
        <path d="M94,380 V490 M194,380 V490" />
        <path
          d="M94,506 V522 M230,506 V522 M94,514 H230"
          stroke="var(--blue-100)"
        />
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
        {/* pendant lamp */}
        <path d="M320,0 V88 M294,88 H346 L332,126 H308 Z" />
        <circle cx="320" cy="138" r="8" />
        {screw(60, 600)}
        <rect
          x="228"
          y="618"
          width="22"
          height="7"
          rx="3.5"
          transform="rotate(-18 239 621)"
        />
        {crosses([
          [40, 160],
          [300, 560],
        ])}
      </ArtSide>
      <Veil />
    </>
  );
}

function ExplodedArt() {
  return (
    <>
      <ArtSide side="l">
        <rect
          x="48"
          y="136"
          width="24"
          height="7"
          rx="3.5"
          transform="rotate(-16 60 139)"
        />
        <rect
          x="88"
          y="166"
          width="24"
          height="7"
          rx="3.5"
          transform="rotate(12 100 169)"
        />
        <rect
          x="54"
          y="192"
          width="24"
          height="7"
          rx="3.5"
          transform="rotate(-4 66 195)"
        />
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
        {screw(120, 420)}
        {screw(160, 450)}
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
        <path d="M80,560 h46 v13 h-33 v34 h-13 Z" />
        {crosses([
          [240, 300],
          [60, 60],
          [200, 640],
        ])}
      </ArtSide>
      <ArtSide side="r">
        <path
          d="M180,40 V660"
          stroke="var(--blue-100)"
          strokeDasharray="4 9"
        />
        {screw(150, 60)}
        {screw(210, 60)}
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
        <path d="M90,120 L130,94 H270 L230,120 Z" />
        <path d="M90,210 H230 V430 H90 Z" />
        <path d="M230,210 L270,184 V404 L230,430" />
        <path d="M90,210 L130,184 H270" />
        <path d="M90,320 H230 M230,320 L270,294" />
        <path d="M90,500 L130,474 H270 L230,500 Z" />
        <circle cx="40" cy="110" r="12" />
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
        <path
          d="M52,110 H86"
          strokeDasharray="3 6"
          stroke="var(--blue-100)"
        />
        {crosses([
          [320, 340],
          [60, 660],
        ])}
      </ArtSide>
      <Veil />
    </>
  );
}

function Arcs() {
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

export default function HeroBackdrop({
  variant = "wireframe",
  mobile = false,
}: {
  variant?: HeroBgVariant;
  mobile?: boolean;
}) {
  // Mobile/tablet: blueprint grid only (side SVGs hide via CSS below 1180px too)
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
        <Arcs />
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
        <BlueprintGrid />
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
      {variant === "exploded" ? <ExplodedArt /> : <WireframeArt />}
    </div>
  );
}
