import type { CSSProperties, ReactNode } from "react";

const variants: Record<string, CSSProperties> = {
  brand: {
    background: "var(--blue-50)",
    color: "var(--blue-deep)",
    border: "1px solid var(--blue-100)",
  },
  accent: {
    background: "var(--blue-50)",
    color: "var(--blue-electric)",
    border: "1px solid var(--blue-100)",
  },
  neutral: {
    background: "var(--gray-100)",
    color: "var(--ink-700)",
    border: "1px solid var(--gray-200)",
  },
};

export default function Badge({
  children,
  variant = "brand",
  style,
}: {
  children: ReactNode;
  variant?: keyof typeof variants;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-body)",
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: "0.02em",
        padding: "6px 12px",
        borderRadius: "var(--radius-pill)",
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
