import type { Metadata } from "next";
import AeoShell from "@/components/aeo/AeoShell";
import AnswerBlock from "@/components/aeo/AnswerBlock";
import ProofGrid from "@/components/aeo/ProofGrid";
import ExamplesLists from "@/components/aeo/ExamplesLists";
import ComparisonTable from "@/components/aeo/ComparisonTable";
import FaqList from "@/components/aeo/FaqList";
import CtaBand from "@/components/aeo/CtaBand";
import SiteJsonLd from "@/components/seo/SiteJsonLd";
import JsonLdScript from "@/components/seo/JsonLdScript";
import { publicEnv } from "@/lib/env";
import { HOUSTON_ASSEMBLY_PATH } from "@/lib/site";
import { buildBreadcrumbList, buildFaqPage, buildService } from "@/lib/seo/schema";
import { HOUSTON_ASSEMBLY_PAGE as PAGE } from "@/content/aeo/furniture-assembly-houston";

/**
 * AEO landing page — see docs/ScrewIt_Pros_Houston_AEO_Schema_Spec.docx.
 *
 * Targets "furniture assembly with pickup and delivery in Houston", a query that
 * returns no Google Maps pack, so it's winnable with zero reviews (unlike the
 * review-ranked head term "best furniture assembly Houston").
 *
 * Everything here is a Server Component: no client JS in the tree apart from the
 * shared Footer. Copy and schema both read from one content module, so the
 * on-page FAQ text and the FAQPage markup cannot drift.
 */

export const metadata: Metadata = {
  title: PAGE.h1,
  description: PAGE.metaDescription,
  alternates: { canonical: HOUSTON_ASSEMBLY_PATH },
  openGraph: {
    type: "website",
    url: HOUSTON_ASSEMBLY_PATH,
    title: PAGE.h1,
    description: PAGE.metaDescription,
    // Next drops inherited openGraph.images once a child declares openGraph,
    // so point at the root OG route explicitly.
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ScrewIt Pros — furniture assembly with pickup and delivery in Houston",
      },
    ],
  },
};

export default function FurnitureAssemblyPickupDeliveryHouston() {
  const base = publicEnv.appUrl.replace(/\/$/, "");
  const pageUrl = `${base}${HOUSTON_ASSEMBLY_PATH}`;

  return (
    <>
      {/* SiteJsonLd emits the #business node this page's Service points at.
          Google resolves @id refs only within a single page's markup, so the
          reference would dangle without it. */}
      <SiteJsonLd />
      <JsonLdScript
        data={buildService({
          base,
          pageUrl,
          name: PAGE.service.name,
          serviceType: PAGE.service.serviceType,
          description: PAGE.service.description,
        })}
      />
      <JsonLdScript data={buildFaqPage({ base, pageUrl, faqs: PAGE.faqs })} />
      <JsonLdScript
        data={buildBreadcrumbList({
          pageUrl,
          trail: [
            { name: "Home", url: `${base}/` },
            { name: "Furniture Assembly with Pickup & Delivery in Houston", url: pageUrl },
          ],
        })}
      />

      <AeoShell>
        <AnswerBlock />
        <ProofGrid />
        <ExamplesLists />
        <ComparisonTable />
        <FaqList />
        <CtaBand />
      </AeoShell>
    </>
  );
}
