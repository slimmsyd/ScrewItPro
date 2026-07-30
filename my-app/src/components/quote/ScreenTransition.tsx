"use client";

import type { ReactNode } from "react";

export default function ScreenTransition({ children }: { children: ReactNode }) {
  return (
    <div
      className="quote-screen-in"
      style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      {children}
    </div>
  );
}
