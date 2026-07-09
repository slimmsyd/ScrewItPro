import type { ReactNode } from "react";

export default function SectionTitle({
  children,
  inverse = false,
  center = false,
}: {
  children: ReactNode;
  inverse?: boolean;
  center?: boolean;
}) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 400,
        fontSize: "var(--text-h2)",
        lineHeight: "var(--leading-heading)",
        letterSpacing: "var(--tracking-display)",
        color: inverse ? "var(--white)" : "var(--text-heading)",
        margin: "0 0 12px",
        textAlign: center ? "center" : "left",
      }}
    >
      {children}
    </h2>
  );
}
