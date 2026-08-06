"use client";

import type { CSSProperties, ReactNode } from "react";
import { Info, Minus, Plus } from "lucide-react";

/**
 * Inline "?" control with hover/focus tooltip for admin Settings.
 * Prefer short plain-language “what / why” copy (not API jargon).
 */
export function HelpTip({ text }: { text: string }) {
  return (
    <span className="sip-admin-help">
      <button
        type="button"
        className="sip-admin-help-btn sip-admin-focus"
        aria-label="What is this?"
        // Native title as a fallback when CSS tooltips are clipped
        title={text}
      >
        ?
      </button>
      <span className="sip-admin-help-bubble" role="tooltip">
        {text}
      </span>
    </span>
  );
}

/** Label + optional ? help (for section eyebrows, not full Rows). */
export function LabelWithHelp({
  children,
  help,
  style,
}: {
  children: ReactNode;
  help?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        ...style,
      }}
    >
      {children}
      {help ? <HelpTip text={help} /> : null}
    </span>
  );
}

export function Head({
  title,
  sub,
  help,
}: {
  title: string;
  sub?: string;
  help?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        paddingBottom: 4,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 400,
          color: "var(--blue-deep)",
          letterSpacing: "-0.01em",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {title}
        {help ? <HelpTip text={help} /> : null}
      </h2>
      {sub && (
        <span
          style={{
            fontSize: 11.5,
            color: "var(--ink-500)",
            marginLeft: "auto",
            textAlign: "right",
          }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

export function Row({
  label,
  hint,
  help,
  children,
  tall,
}: {
  label: string;
  /** Optional secondary line under the label (keep short). */
  hint?: string;
  /** Plain-language “what/why” for the ? tooltip. */
  help?: string;
  children: ReactNode;
  tall?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: tall ? "flex-start" : "center",
        gap: 18,
        padding: "11px 0",
        borderBottom: "1px solid var(--gray-100)",
        minHeight: tall ? 0 : 44,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingTop: tall ? 3 : 0,
        }}
      >
        <div
          style={{
            fontSize: 12.5,
            color: "var(--ink-900)",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{label}</span>
          {help ? <HelpTip text={help} /> : null}
        </div>
        {hint && (
          <div
            style={{
              fontSize: 11,
              color: "var(--ink-500)",
              marginTop: 2,
              lineHeight: 1.4,
            }}
          >
            {hint}
          </div>
        )}
      </div>
      <div
        style={{
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Stepper({
  value,
  onChange,
  unit,
  step = 1,
  min = 0,
  max = 9999,
  w = 60,
}: {
  value: number;
  onChange: (n: number) => void;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
  w?: number;
}) {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid var(--border-default)",
        borderRadius: 9,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <button
        type="button"
        className="sip-admin-focus"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - step))}
        style={{
          width: 30,
          height: 34,
          display: "grid",
          placeItems: "center",
          color: "var(--ink-500)",
          border: "none",
          borderRight: "1px solid var(--gray-100)",
          background: "transparent",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <Minus size={12} />
      </button>
      <span
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          padding: "0 9px",
          width: w,
          justifyContent: "flex-end",
        }}
      >
        <input
          type="number"
          className="sip-admin-num sip-admin-focus"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            let n = Number(e.target.value);
            if (!Number.isFinite(n)) n = min;
            onChange(Math.max(min, Math.min(max, n)));
          }}
          style={{
            width: "100%",
            border: 0,
            outline: "none",
            textAlign: "right",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "var(--font-body)",
            color: "var(--ink-900)",
            background: "transparent",
          }}
        />
        {unit && (
          <em
            style={{
              fontStyle: "normal",
              fontSize: 10.5,
              color: "var(--ink-500)",
              whiteSpace: "nowrap",
            }}
          >
            {unit}
          </em>
        )}
      </span>
      <button
        type="button"
        className="sip-admin-focus"
        aria-label="Increase"
        onClick={() => onChange(Math.min(max, value + step))}
        style={{
          width: 30,
          height: 34,
          display: "grid",
          placeItems: "center",
          color: "var(--ink-500)",
          border: "none",
          borderLeft: "1px solid var(--gray-100)",
          background: "transparent",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <Plus size={12} />
      </button>
    </span>
  );
}

export function G({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
        columnGap: 26,
      }}
    >
      {children}
    </div>
  );
}

export function Band({
  children,
  cols = "repeat(auto-fit, minmax(260px, 1fr))",
}: {
  children: ReactNode;
  cols?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: cols,
        gap: 16,
        marginTop: 16,
        alignItems: "start",
      }}
    >
      {children}
    </div>
  );
}

export function Note({
  children,
  tone = "g",
  icon,
}: {
  children: ReactNode;
  tone?: "g" | "b" | "w";
  icon?: ReactNode;
}) {
  const bg =
    tone === "b"
      ? "var(--blue-50)"
      : tone === "w"
        ? "var(--status-warning-bg)"
        : "var(--gray-50)";
  const fg =
    tone === "b"
      ? "var(--blue-700)"
      : tone === "w"
        ? "#8A5000"
        : "var(--ink-500)";
  return (
    <div
      style={{
        background: bg,
        borderRadius: 10,
        padding: "10px 12px",
        display: "flex",
        gap: 9,
        fontSize: 11.5,
        color: fg,
        lineHeight: 1.5,
        marginTop: 14,
      }}
    >
      <span style={{ marginTop: 1, flex: "0 0 13px" }}>
        {icon ?? <Info size={13} color="var(--ink-500)" />}
      </span>
      <span style={{ minWidth: 0 }}>{children}</span>
    </div>
  );
}

export const eyebrow: CSSProperties = {
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--ink-500)",
};

export const tierInput: CSSProperties = {
  width: 52,
  border: "1px solid var(--border-default)",
  borderRadius: 7,
  padding: "5px 8px",
  fontSize: 12.5,
  fontWeight: 700,
  fontFamily: "var(--font-body)",
  color: "var(--ink-900)",
  textAlign: "right",
  background: "#fff",
};

export const iconBtn: CSSProperties = {
  color: "var(--ink-500)",
  width: 28,
  height: 28,
  display: "grid",
  placeItems: "center",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 0,
  borderRadius: 8,
};

export const linkAdd: CSSProperties = {
  marginLeft: "auto",
  fontSize: 11.5,
  fontWeight: 600,
  color: "var(--blue-electric)",
  display: "flex",
  alignItems: "center",
  gap: 4,
  background: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
  padding: "4px 0",
};

export const btnGhost: CSSProperties = {
  height: 34,
  minHeight: 34,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--border-default)",
  background: "#fff",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--ink-700)",
  fontFamily: "var(--font-body)",
  cursor: "pointer",
};

export const btnAccent: CSSProperties = {
  height: 34,
  minHeight: 34,
  padding: "0 14px",
  borderRadius: 8,
  border: "none",
  background: "var(--blue-electric)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 700,
  fontFamily: "var(--font-body)",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
};
