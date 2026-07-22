import { DEFAULT_ASSEMBLY_CENTS } from "@/lib/quote/pricing";
import type { QuoteItem } from "@/lib/quote/types";

export type CatalogProduct = {
  id: string;
  brand: string;
  articleId: string;
  name: string;
  icon: string;
  assemblyCents: number;
  retailers: string[];
};

export const RETAILER_CHIPS = [
  "IKEA",
  "Wayfair",
  "Amazon",
  "Target",
  "Walmart",
] as const;

export const STORE_CHIPS = [
  "IKEA",
  "Wayfair",
  "Costco",
  "Ashley",
  "Other",
] as const;

export const MOCK_PRODUCTS: CatalogProduct[] = [
  {
    id: "ikea-malm",
    brand: "IKEA",
    articleId: "204.035.75",
    name: "MALM 6-drawer dresser, white",
    icon: "archive",
    assemblyCents: 5900,
    retailers: ["IKEA"],
  },
  {
    id: "ikea-pax",
    brand: "IKEA",
    articleId: "791.299.38",
    name: "PAX wardrobe combination",
    icon: "door-open",
    assemblyCents: 12900,
    retailers: ["IKEA"],
  },
  {
    id: "ikea-kallax",
    brand: "IKEA",
    articleId: "802.758.87",
    name: "KALLAX shelf unit, 4×4",
    icon: "library",
    assemblyCents: 3900,
    retailers: ["IKEA", "Wayfair"],
  },
  {
    id: "wayfair-desk",
    brand: "Wayfair",
    articleId: "W001234567",
    name: "Mid-century writing desk",
    icon: "table",
    assemblyCents: DEFAULT_ASSEMBLY_CENTS,
    retailers: ["Wayfair", "Amazon"],
  },
  {
    id: "target-bed",
    brand: "Target",
    articleId: "TG-88291",
    name: "Queen platform bed frame",
    icon: "bed-double",
    assemblyCents: 6900,
    retailers: ["Target", "Walmart"],
  },
  {
    id: "amazon-chair",
    brand: "Amazon",
    articleId: "B0EXAMPLE",
    name: "Ergonomic office chair",
    icon: "armchair",
    assemblyCents: 3500,
    retailers: ["Amazon", "Walmart"],
  },
];

export function searchCatalog(
  query: string,
  retailer?: string | null
): CatalogProduct[] {
  const q = query.trim().toLowerCase();
  return MOCK_PRODUCTS.filter((p) => {
    if (retailer && retailer !== "All" && !p.retailers.includes(retailer)) {
      return false;
    }
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.articleId.toLowerCase().includes(q) ||
      q.includes("ikea") ||
      q.includes("http")
    );
  });
}

export function catalogToQuoteItem(p: CatalogProduct): QuoteItem {
  return {
    /** Stable id so re-clicking the same product can toggle it off. */
    id: `hub-${p.id}`,
    brand: p.brand,
    name: p.name,
    icon: p.icon,
    assemblyCents: p.assemblyCents,
    src: "hub",
    articleId: p.articleId,
    quantity: 1,
  };
}
