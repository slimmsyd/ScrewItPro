import type { Metadata } from "next";
import ReferralsPageClient from "./ReferralsPageClient";

export const metadata: Metadata = {
  title: "Refer & Earn | ScrewIt Pros",
  robots: { index: false, follow: false },
};

export default function ReferralsPage() {
  return <ReferralsPageClient />;
}
