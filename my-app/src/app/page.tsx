import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import SiteJsonLd from "@/components/seo/SiteJsonLd";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { publicEnv } from "@/lib/env";
import { buildFaqPage } from "@/lib/seo/schema";
import { HOME_FAQS } from "@/lib/seo/homeFaqs";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  const base = publicEnv.appUrl.replace(/\/$/, "");

  return (
    <>
      <SiteJsonLd />
      <JsonLdScript
        data={buildFaqPage({ base, pageUrl: `${base}/`, faqs: HOME_FAQS })}
      />
      <LandingPage />
    </>
  );
}
