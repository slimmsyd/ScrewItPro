import type { Metadata } from "next";
import LandingPage from "@/components/home/LandingPage";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <JsonLd />
      <LandingPage />
    </>
  );
}
