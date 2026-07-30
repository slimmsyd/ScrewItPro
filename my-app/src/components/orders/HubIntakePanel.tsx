"use client";

import type { CSSProperties } from "react";
import { HUB_INTAKE } from "@/lib/orders/post-book-content";

/**
 * Shared hub ship/drop instructions for confirmation + track.
 * Content from post-book-content.ts only.
 */
export default function HubIntakePanel({
  orderNumber,
  compact = false,
}: {
  orderNumber: string;
  compact?: boolean;
}) {
  const label = HUB_INTAKE.labelTemplate(orderNumber);

  return (
    <div
      id="next-step"
      style={{
        ...panelStyle,
        padding: compact ? "14px 16px" : "16px 18px",
      }}
    >
      <div style={eyebrowStyle}>Your next step</div>
      <div style={titleStyle}>Get your items to our hub</div>
      <div style={hubNameStyle}>{HUB_INTAKE.name}</div>
      {HUB_INTAKE.lines.map((line) => (
        <p key={line} style={lineStyle}>
          {line}
        </p>
      ))}
      <p style={{ ...lineStyle, marginTop: 10 }}>
        Mark every box:{" "}
        <strong style={{ color: "var(--blue-deep)" }}>{label}</strong>
      </p>
      {!compact && (
        <ul style={listStyle}>
          {HUB_INTAKE.packingTips.map((tip) => (
            <li key={tip} style={{ marginBottom: 4 }}>
              {tip}
            </li>
          ))}
        </ul>
      )}
      <p style={supportStyle}>Questions? {HUB_INTAKE.supportEmail}</p>
    </div>
  );
}

const panelStyle: CSSProperties = {
  textAlign: "left",
  background: "var(--blue-50)",
  border: "1px solid var(--border-default)",
  borderRadius: 14,
  boxSizing: "border-box",
};

const eyebrowStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--blue-electric)",
};

const titleStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 15,
  fontWeight: 700,
  color: "var(--blue-deep)",
  marginTop: 4,
  marginBottom: 8,
};

const hubNameStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 14,
  fontWeight: 700,
  color: "var(--ink-900)",
  marginBottom: 4,
};

const lineStyle: CSSProperties = {
  margin: "0 0 4px",
  fontFamily: "var(--font-body)",
  fontSize: 13.5,
  lineHeight: 1.45,
  color: "var(--ink-500)",
};

const listStyle: CSSProperties = {
  margin: "10px 0 0",
  paddingLeft: 18,
  fontFamily: "var(--font-body)",
  fontSize: 13,
  lineHeight: 1.45,
  color: "var(--ink-500)",
};

const supportStyle: CSSProperties = {
  margin: "10px 0 0",
  fontFamily: "var(--font-body)",
  fontSize: 12.5,
  color: "var(--ink-300)",
};
