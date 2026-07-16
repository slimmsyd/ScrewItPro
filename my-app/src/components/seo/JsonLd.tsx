import { publicEnv } from "@/lib/env";
import { HOUSTON_CENTER, HOUSTON_METRO_RADIUS_M } from "@/lib/places";

/**
 * JSON-LD structured data for the home page.
 *
 * - LocalBusiness (HomeAndConstructionBusiness) → rich local SERP treatment,
 *   with the Houston service area from the same constants the map uses.
 * - WebSite → brand knowledge-panel / sitelinks eligibility.
 *
 * Server component; the JSON is inlined via a <script type="application/ld+json">.
 * URLs derive from NEXT_PUBLIC_APP_URL, so they self-correct at domain cutover.
 */
export default function JsonLd() {
  const base = publicEnv.appUrl.replace(/\/$/, "");
  const name = "ScrewIt Pros";

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${base}/#business`,
    name,
    url: base,
    description:
      "Furniture assembly and white-glove delivery for the Houston metro. We pick up your flat-pack furniture, assemble and QC it at our hub, then deliver it fully built and placed in your home.",
    slogan: "If You Don't Want to Do It, ScrewIt!",
    image: `${base}/opengraph-image`,
    logo: `${base}/icon-512.png`,
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: HOUSTON_CENTER.lat,
        longitude: HOUSTON_CENTER.lng,
      },
      geoRadius: HOUSTON_METRO_RADIUS_M,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Houston",
      addressRegion: "TX",
      addressCountry: "US",
    },
    priceRange: "$$",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name,
    publisher: { "@id": `${base}/#business` },
    inLanguage: ["en-US", "es-US"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
