import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Order | ScrewIt Pros",
    template: "%s | ScrewIt Pros",
  },
  robots: { index: false, follow: false },
};

export default function OrdersLayout({ children }: { children: ReactNode }) {
  return children;
}
