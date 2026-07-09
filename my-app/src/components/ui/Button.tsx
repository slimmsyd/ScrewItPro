"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { height: 40, padding: "0 18px", fontSize: 14.5 },
  md: { height: 48, padding: "0 22px", fontSize: 15.5 },
  lg: { height: 54, padding: "0 28px", fontSize: 16 },
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: "var(--blue-deep)",
    color: "var(--white)",
    border: "none",
  },
  secondary: {
    background: "var(--white)",
    color: "var(--blue-deep)",
    border: "1px solid var(--gray-200)",
  },
  ghost: {
    background: "transparent",
    color: "var(--ink-700)",
    border: "none",
  },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-body)",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background var(--duration-fast) var(--ease-out), opacity var(--duration-fast) var(--ease-out)",
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (variant === "primary") e.currentTarget.style.background = "var(--blue-700)";
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (variant === "primary") e.currentTarget.style.background = "var(--blue-deep)";
        props.onMouseLeave?.(e);
      }}
      {...props}
    >
      {children}
    </button>
  );
}
