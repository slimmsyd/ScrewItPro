"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Check,
  Hammer,
  MapPin,
  PackageX,
  Ruler,
  Sofa,
  Sparkles,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Asset-free WhyUs vignettes — one composed icon scene per tab, in the same
 * visual language as Differentiators' GuaranteeVisual/RatedVisual (soft blue
 * blobs for depth + white floating icon chips that carry the meaning).
 * Meaning lives in the icons/labels; blobs are decorative depth only.
 */

const AREA_W = 360;
const AREA_H = 280;

/** Gentle idle bob; skipped under reduced motion. */
function Float({
  children,
  delay = 0,
  reduce,
  style,
}: {
  children: ReactNode;
  delay?: number;
  reduce: boolean;
  style?: CSSProperties;
}) {
  if (reduce) return <div style={style}>{children}</div>;
  return (
    <motion.div
      style={style}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4.5, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function Blob({ style }: { style: CSSProperties }) {
  return <div aria-hidden style={{ borderRadius: 14, ...style }} />;
}

function Chip({
  icon: Icon,
  label,
  color = "var(--blue-electric)",
  size = 36,
  style,
}: {
  icon: LucideIcon;
  label?: string;
  color?: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: label ? 8 : 0,
        background: "var(--white)",
        border: "1px solid var(--gray-100)",
        borderRadius: 12,
        padding: label ? "8px 12px" : 0,
        width: label ? undefined : size,
        height: label ? undefined : size,
        justifyContent: "center",
        boxShadow: "0 6px 16px rgba(11,16,48,0.1)",
        ...style,
      }}
    >
      <Icon size={label ? 15 : 18} color={color} aria-hidden />
      {label && (
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--ink-700)",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

/** Green "passed" badge, matching GuaranteeVisual. */
function CheckBadge({ style }: { style: CSSProperties }) {
  return (
    <div
      aria-hidden
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: "#16a34a",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 8px 16px rgba(22,163,74,0.28)",
        ...style,
      }}
    >
      <Check size={19} color="white" strokeWidth={3} />
    </div>
  );
}

function Area({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden
      style={{ position: "relative", width: AREA_W, height: AREA_H }}
    >
      {children}
    </div>
  );
}

/* ---- 1. Built in Our Workshop ---- */
function Workshop({ label, reduce }: { label: string; reduce: boolean }) {
  return (
    <Area>
      {/* workbench */}
      <Blob
        style={{
          position: "absolute",
          left: 46,
          top: 208,
          width: 268,
          height: 16,
          borderRadius: 6,
          background: "linear-gradient(180deg, var(--blue-300), var(--blue-500))",
          opacity: 0.9,
        }}
      />
      {/* dresser being assembled */}
      <Blob
        style={{
          position: "absolute",
          left: 132,
          top: 120,
          width: 104,
          height: 90,
          background:
            "linear-gradient(150deg, var(--blue-electric), var(--blue-deep))",
          boxShadow: "0 16px 26px rgba(4,32,155,0.22)",
        }}
      />
      {/* offset drawer (mid-build) */}
      <Blob
        style={{
          position: "absolute",
          left: 240,
          top: 142,
          width: 46,
          height: 26,
          borderRadius: 6,
          background: "linear-gradient(150deg, #c4d4f5, var(--blue-300))",
          boxShadow: "0 8px 14px rgba(4,32,155,0.14)",
        }}
      />
      <Float reduce={reduce} delay={0} style={{ position: "absolute", left: 30, top: 40 }}>
        <Chip icon={Wrench} />
      </Float>
      <Float reduce={reduce} delay={0.7} style={{ position: "absolute", left: 288, top: 30 }}>
        <Chip icon={Hammer} />
      </Float>
      <Float reduce={reduce} delay={1.2} style={{ position: "absolute", left: 300, top: 128 }}>
        <Chip icon={Ruler} />
      </Float>
      <Float reduce={reduce} delay={0.35} style={{ position: "absolute", left: 18, top: 150 }}>
        <Chip icon={Wrench} label={label} />
      </Float>
    </Area>
  );
}

/* ---- 2. Your Home Stays Yours ---- */
function CleanHome({ label, reduce }: { label: string; reduce: boolean }) {
  return (
    <Area>
      {/* sofa back + seat */}
      <Blob
        style={{
          position: "absolute",
          left: 78,
          top: 128,
          width: 204,
          height: 34,
          borderRadius: 16,
          background: "linear-gradient(180deg, var(--blue-300), var(--blue-400))",
        }}
      />
      <Blob
        style={{
          position: "absolute",
          left: 70,
          top: 156,
          width: 220,
          height: 64,
          borderRadius: 18,
          background: "linear-gradient(160deg, var(--blue-200), var(--blue-400))",
          boxShadow: "0 16px 26px rgba(4,32,155,0.16)",
        }}
      />
      {/* lamp */}
      <Blob
        style={{
          position: "absolute",
          left: 306,
          top: 120,
          width: 6,
          height: 100,
          borderRadius: 3,
          background: "var(--blue-300)",
        }}
      />
      <Blob
        style={{
          position: "absolute",
          left: 292,
          top: 102,
          width: 34,
          height: 22,
          borderRadius: "10px 10px 4px 4px",
          background: "linear-gradient(180deg, #dfe9ff, var(--blue-200))",
        }}
      />
      <Float reduce={reduce} delay={0} style={{ position: "absolute", left: 34, top: 48 }}>
        <Chip icon={Sparkles} />
      </Float>
      <Float reduce={reduce} delay={0.8} style={{ position: "absolute", left: 30, top: 158 }}>
        <Chip icon={PackageX} label={label} color="var(--status-error)" />
      </Float>
      <Float reduce={reduce} delay={0.4} style={{ position: "absolute", left: 258, top: 44 }}>
        <Chip icon={Sofa} />
      </Float>
      <CheckBadge style={{ position: "absolute", left: 296, top: 176 }} />
    </Area>
  );
}

/* ---- 3. Inspected & Photographed ---- */
function QC({ label, reduce }: { label: string; reduce: boolean }) {
  return (
    <Area>
      {/* checklist mock card */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 54,
          top: 74,
          width: 214,
          borderRadius: 16,
          background: "var(--white)",
          border: "1px solid var(--gray-100)",
          boxShadow: "0 18px 34px rgba(11,16,48,0.14)",
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {[64, 92, 76].map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                background: "#e5f5ee",
                display: "grid",
                placeItems: "center",
                flex: "none",
              }}
            >
              <Check size={13} color="#16a34a" strokeWidth={3} />
            </span>
            <span
              style={{
                height: 8,
                width: `${w}%`,
                maxWidth: w * 1.6,
                borderRadius: 4,
                background: "var(--gray-100)",
              }}
            />
          </div>
        ))}
      </div>
      <Float reduce={reduce} delay={0.3} style={{ position: "absolute", left: 234, top: 52 }}>
        <Chip icon={Camera} label={label} />
      </Float>
      <CheckBadge style={{ position: "absolute", left: 44, top: 178 }} />
      <Float reduce={reduce} delay={0.9} style={{ position: "absolute", left: 262, top: 178 }}>
        <Chip icon={Sparkles} />
      </Float>
    </Area>
  );
}

/* ---- 4. Delivered Ready to Use ---- */
function Delivery({ label, reduce }: { label: string; reduce: boolean }) {
  return (
    <Area>
      {/* placed furniture */}
      <Blob
        style={{
          position: "absolute",
          left: 118,
          top: 150,
          width: 128,
          height: 70,
          borderRadius: 16,
          background:
            "linear-gradient(160deg, var(--blue-electric), var(--blue-deep))",
          boxShadow: "0 18px 30px rgba(4,32,155,0.24)",
        }}
      />
      {/* floor shadow */}
      <Blob
        style={{
          position: "absolute",
          left: 108,
          top: 224,
          width: 148,
          height: 12,
          borderRadius: 999,
          background: "rgba(4,32,155,0.12)",
        }}
      />
      <Float reduce={reduce} delay={0} style={{ position: "absolute", left: 150, top: 60 }}>
        <Chip icon={MapPin} label={label} />
      </Float>
      <Float reduce={reduce} delay={0.7} style={{ position: "absolute", left: 40, top: 96 }}>
        <Chip icon={Truck} />
      </Float>
      <CheckBadge style={{ position: "absolute", left: 278, top: 150 }} />
    </Area>
  );
}

const VIGNETTES = [Workshop, CleanHome, QC, Delivery];

export default function WhyUsVignette({
  index,
  label,
  reduce,
}: {
  index: number;
  label: string;
  reduce: boolean;
}) {
  const V = VIGNETTES[index] ?? VIGNETTES[0];
  return <V label={label} reduce={reduce} />;
}
