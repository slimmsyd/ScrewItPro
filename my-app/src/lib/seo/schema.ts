/**
 * JSON-LD builders. Pure functions — no JSX, no React, no client imports.
 *
 * Graph identity: every node carries a stable `@id`, and cross-references use
 * `{ "@id": ... }`. Google resolves those refs only *within one page's markup*,
 * so a page emitting Service must also emit the LocalBusiness node it points at.
 * Same `@id` + same builder = same entity, not a duplicate.
 *
 * No aggregateRating / review markup here, by design: the business has no real
 * reviews yet, and inventing them violates Google's guidelines.
 */

import { BUSINESS, businessId, websiteId } from "@/lib/seo/business";
import { isWaitlist, JOIN_PATH } from "@/lib/site";

export type Faq = { q: string; a: string };

type Json = Record<string, unknown>;

/**
 * Strips keys whose value is undefined (recursively, through plain objects and
 * arrays). Lets builders write `telephone: BUSINESS.telephone` unconditionally:
 * when the fact doesn't exist yet, the key simply never reaches the output.
 */
export function compact<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((v) => v !== undefined)
      .map((v) => compact(v)) as unknown as T;
  }
  if (value && typeof value === "object" && value.constructor === Object) {
    const out: Json = {};
    for (const [k, v] of Object.entries(value as Json)) {
      if (v === undefined) continue;
      out[k] = compact(v);
    }
    return out as T;
  }
  return value;
}

const CONTEXT = "https://schema.org";

/**
 * The business node. Rendered on every page that references #business.
 *
 * areaServed carries both the GeoCircle (same constants the service-area map
 * draws) and the explicit city list — the cities are what an AI assistant
 * actually quotes back when asked "do they serve Katy?".
 */
export function buildLocalBusiness(base: string) {
  return compact({
    "@context": CONTEXT,
    "@type": "HomeAndConstructionBusiness",
    "@id": businessId(base),
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    url: base,
    description: BUSINESS.description,
    slogan: BUSINESS.slogan,
    image: `${base}/opengraph-image`,
    logo: `${base}/icon-512.png`,
    email: BUSINESS.email,
    telephone: BUSINESS.telephone,
    priceRange: BUSINESS.priceRange,
    address: {
      "@type": "PostalAddress",
      addressLocality: BUSINESS.address.locality,
      addressRegion: BUSINESS.address.region,
      addressCountry: BUSINESS.address.country,
    },
    areaServed: [
      {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: BUSINESS.geo.lat,
          longitude: BUSINESS.geo.lng,
        },
        geoRadius: BUSINESS.geo.radiusM,
      },
      ...BUSINESS.areaServedCities.map((name) => ({
        "@type": "City",
        name,
      })),
    ],
    openingHoursSpecification: BUSINESS.openingHours?.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [...h.days],
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: BUSINESS.sameAs ? [...BUSINESS.sameAs] : undefined,
  });
}

export function buildWebSite(base: string) {
  return compact({
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": websiteId(base),
    url: base,
    name: BUSINESS.name,
    publisher: { "@id": businessId(base) },
    inLanguage: "en-US",
  });
}

/**
 * FAQPage. `faqs` must be the same array the page renders — never a re-typed
 * copy. Schema text that drifts from visible text is what Google penalizes.
 */
export function buildFaqPage({
  base,
  pageUrl,
  faqs,
}: {
  base: string;
  pageUrl: string;
  faqs: readonly Faq[];
}) {
  return compact({
    "@context": CONTEXT,
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    isPartOf: { "@id": websiteId(base) },
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
}

/**
 * Service offered on a specific page.
 *
 * Uses AggregateOffer/lowPrice rather than Offer/price: assembly *starts* at
 * $49 and varies by size, so asserting an exact price would contradict the
 * visible copy. `availability` tracks SITE_MODE — PreOrder while the site is in
 * waitlist mode, InStock once quoting goes live.
 */
export function buildService({
  base,
  pageUrl,
  name,
  serviceType,
  description,
}: {
  base: string;
  pageUrl: string;
  name: string;
  serviceType: string;
  description: string;
}) {
  return compact({
    "@context": CONTEXT,
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name,
    serviceType,
    description,
    provider: { "@id": businessId(base) },
    areaServed: BUSINESS.areaServedCities.map((city) => ({
      "@type": "City",
      name: city,
    })),
    offers: {
      "@type": "AggregateOffer",
      lowPrice: BUSINESS.startingPriceUsd.toFixed(2),
      priceCurrency: BUSINESS.currency,
      availability: isWaitlist
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock",
      url: `${base}${JOIN_PATH}`,
      seller: { "@id": businessId(base) },
      description: `Furniture assembly starting at $${BUSINESS.startingPriceUsd}, including pickup and ready-to-use delivery.`,
    },
  });
}

export function buildBreadcrumbList({
  pageUrl,
  trail,
}: {
  pageUrl: string;
  trail: readonly { name: string; url: string }[];
}) {
  return compact({
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}
