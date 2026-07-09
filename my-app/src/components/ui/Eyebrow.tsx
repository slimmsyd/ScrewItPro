import type { ReactNode } from "react";

export default function Eyebrow({
  children,
  color = "var(--blue-electric)",
  center = false,
}: {
  children: ReactNode;
  color?: string;
  center?: boolean;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "var(--tracking-caps)",
        textTransform: "uppercase",
        color,
        marginBottom: 14,
        textAlign: center ? "center" : "left",
      }}
    >
      {children}
    </div>
  );
}
