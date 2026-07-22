import type { ReactNode } from "react";
import { QuoteProvider } from "@/lib/quote/context";

export const metadata = {
  title: "Get a price | ScrewIt Pros",
  description:
    "Instant furniture assembly quote for Houston: pickup, workshop build, white-glove delivery.",
};

export default function QuoteLayout({ children }: { children: ReactNode }) {
  return <QuoteProvider>{children}</QuoteProvider>;
}
