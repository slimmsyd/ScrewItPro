"use client";

import type { CSSProperties, ReactNode } from "react";

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 700,
        color: "var(--ink-500)",
        marginBottom: 6,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </label>
  );
}

export const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 48,
  borderRadius: 10,
  border: "1.5px solid var(--border-default)",
  padding: "10px 14px",
  fontSize: 15,
  fontFamily: "var(--font-body)",
  marginBottom: 14,
  outline: "none",
  boxSizing: "border-box",
};

export const stepperBtn: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  border: "1px solid var(--border-default)",
  background: "#fff",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
};
