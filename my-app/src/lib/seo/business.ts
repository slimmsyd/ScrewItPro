/**
 * Single source of truth for ScrewIt Pros business facts (NAP + service area).
 *
 * Everything machine-readable about the business derives from here: JSON-LD
 * builders (@/lib/seo/schema), the Houston geo constants (@/lib/places), and
 * page copy that quotes a price or a city.
 *
 * Deliberately absent: `telephone`, `sameAs`, and `openingHours`. There is no
 * real phone number, no claimed directory profile, and no confirmed hours yet.
 * Emitting invented values would be a factual claim to search and AI engines,
 * so the builders omit undefined fields entirely (see `compact` in schema.ts).
 * Filling any of them in is a one-line change here.
 */

export type BusinessHours = {
  days: readonly string[];
  opens: string;
  closes: string;
};

export const BUSINESS = {
  name: "ScrewIt Pros",
  legalName: "ScrewIt Pros LLC",
  slogan: "If You Don't Want to Do It, ScrewIt!",
  description:
    "Furniture assembly and white-glove delivery for the Houston metro. We pick up your flat-pack furniture, assemble and QC it at our hub, then deliver it fully built and placed in your home.",
  email: "hello@screwitpro.com",
  /**
   * Customer-care inbox for live orders (hub intake, tracking, post-book help).
   * Distinct from `email`, which is the general/legal contact quoted in schema
   * and the terms + privacy pages.
   */
  careEmail: "care@screwitpro.com",
  priceRange: "$$",

  /** Assembly price floor. Quoted on-page as "from $49" — it is not a fixed price. */
  startingPriceUsd: 49,
  currency: "USD",

  address: {
    locality: "Houston",
    region: "TX",
    country: "US",
  },

  /**
   * Downtown Houston hub fallback (service-area center).
   * Default radius: 40 miles (product default D1 / vault, 2026-07-30).
   * Live ops may override via app_settings.hub (Admin Settings).
   * Runtime gate: lib/config/service-area + /api/public/service-area.
   * These constants are fallback only when DB/config is unavailable.
   */
  geo: {
    lat: 29.7604,
    lng: -95.3698,
    /** 40 mi × 1609.344 m/mi */
    radiusM: 64_374,
    radiusMiles: 40,
  },

  areaServedCities: [
    "Houston",
    "Katy",
    "Sugar Land",
    "The Woodlands",
    "Pearland",
    "Cypress",
    "Spring",
  ],

  telephone: undefined as string | undefined,
  sameAs: undefined as readonly string[] | undefined,
  openingHours: undefined as readonly BusinessHours[] | undefined,
} as const;

/**
 * Stable JSON-LD node identities. Google resolves `@id` references only within
 * a single page's markup, so any page that references #business must also emit
 * the business node itself.
 */
export const businessId = (base: string) => `${base}/#business`;
export const websiteId = (base: string) => `${base}/#website`;
