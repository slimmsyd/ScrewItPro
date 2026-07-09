"use client";

import type { CSSProperties, ReactNode } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Container({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  const mobile = useIsMobile();
  return (
    <div
      className={className}
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: mobile ? "0 20px" : "0 32px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
