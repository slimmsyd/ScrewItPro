/**
 * Retailer / store display config for quote + marketing.
 *
 * IMPORTANT: SUPPORTED_RETAILERS is advisory display only — never a gate.
 * POST /api/quote/lookup-product deliberately has no hostname allowlist
 * ("the real gate is whether parsing succeeds"). Wiring this list into
 * the lookup route would silently break paste-a-link for unlisted retailers.
 */

export type RetailerBrand = {
  name: string;
  logo: string;
  /** Soft tile fill behind the logo (Lugg-style app icon) */
  tile: string;
};

/** Brands we showcase (marketing strip + BuyMode logo strip). Not an allowlist. */
export const SUPPORTED_RETAILERS: readonly RetailerBrand[] = [
  { name: "IKEA", logo: "/assets/retailers/ikea.svg", tile: "#FFDB00" },
  { name: "Wayfair", logo: "/assets/retailers/wayfair.png", tile: "#F0F2F7" },
  { name: "Amazon", logo: "/assets/retailers/amazon.svg", tile: "#FFF3E0" },
  { name: "Target", logo: "/assets/retailers/target.svg", tile: "#FDECEA" },
  { name: "Walmart", logo: "/assets/retailers/walmart.svg", tile: "#E8F4FF" },
  { name: "Costco", logo: "/assets/retailers/costco.png", tile: "#EEF2F8" },
  { name: "Ashley", logo: "/assets/retailers/ashley.png", tile: "#F0F2F7" },
  {
    name: "Crate & Barrel",
    logo: "/assets/retailers/crate-and-barrel.png",
    tile: "#F4F1EC",
  },
] as const;

/**
 * Stores we physically collect from (StoreMode chips).
 * Operational config for the "waiting at the store" entry path.
 */
export const COLLECTION_STORES = [
  "IKEA",
  "Wayfair",
  "Costco",
  "Ashley",
  "Other",
] as const;

export type CollectionStore = (typeof COLLECTION_STORES)[number];
