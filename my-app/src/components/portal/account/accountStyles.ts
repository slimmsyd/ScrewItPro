import type { CSSProperties } from "react";

/** Shared Account silo tokens — match design_handoff_portal Account view. */

export const accountCardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid var(--border-default)",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 8px 24px -18px rgba(4, 32, 155, 0.12)",
};

export const fieldLabelStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 12.5,
  fontWeight: 700,
  color: "var(--ink-500)",
  marginBottom: 7,
};

export const fieldBoxStyle: CSSProperties = {
  height: 50,
  borderRadius: 10,
  border: "1.5px solid var(--border-default)",
  background: "#fff",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "0 14px",
  boxSizing: "border-box" as const,
  width: "100%",
};

export const fieldInputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  fontWeight: 600,
  color: "var(--ink-900)",
};

export const primaryBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  height: 44,
  minHeight: 44,
  padding: "0 20px",
  borderRadius: 12,
  background: "var(--blue-deep)",
  color: "#fff",
  fontFamily: "var(--font-body)",
  fontWeight: 700,
  fontSize: 14,
  letterSpacing: "-0.01em",
  border: "1px solid var(--blue-deep)",
  boxShadow: "0 8px 20px -8px rgba(4, 32, 155, 0.5)",
  cursor: "pointer",
  textDecoration: "none",
};

export const ghostBtnStyle: CSSProperties = {
  ...primaryBtnStyle,
  background: "#fff",
  color: "var(--blue-deep)",
  border: "1px solid var(--border-default)",
  boxShadow: "none",
};

export const dashedAddStyle: CSSProperties = {
  border: "1.5px dashed var(--border-default)",
  borderRadius: 14,
  padding: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  color: "var(--blue-electric)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  fontWeight: 700,
  background: "transparent",
  cursor: "pointer",
  width: "100%",
  minHeight: 52,
  transition: "background 0.18s ease, border-color 0.18s ease",
};

export const defaultBadgeStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 10.5,
  fontWeight: 700,
  color: "var(--status-success)",
  background: "var(--status-success-bg)",
  borderRadius: 999,
  padding: "2px 8px",
  letterSpacing: "0.02em",
};

export const capsLabelStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--ink-300)",
};
