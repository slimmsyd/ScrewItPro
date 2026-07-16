import { publicEnv } from "@/lib/env";
import { buildLocalBusiness, buildWebSite } from "@/lib/seo/schema";
import JsonLdScript from "@/components/seo/JsonLdScript";

/**
 * Site-wide JSON-LD: the LocalBusiness entity and the WebSite it publishes.
 *
 * Render this on every page that references #business — Google resolves `@id`
 * only within a single page's markup, so a Service pointing at #business needs
 * the business node present on that same page. Identical `@id` across pages
 * means one entity, not duplicates.
 *
 * URLs derive from NEXT_PUBLIC_APP_URL, so they self-correct at domain cutover.
 */
export default function SiteJsonLd() {
  const base = publicEnv.appUrl.replace(/\/$/, "");

  return (
    <>
      <JsonLdScript data={buildLocalBusiness(base)} />
      <JsonLdScript data={buildWebSite(base)} />
    </>
  );
}
