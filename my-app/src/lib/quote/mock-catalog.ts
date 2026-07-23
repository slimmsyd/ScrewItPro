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
  /** Optional product photo so catalog picks flow image into order summary. */
  imageUrl?: string;
};

/** Stable demo photos (Unsplash) — catalog path previously had zero images. */
const DEMO_PHOTOS = {
  dresser:
    "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=200&q=80",
  wardrobe:
    "https://images.unsplash.com/photo-1558997519-83ea9252edf8?auto=format&fit=crop&w=200&q=80",
  shelf:
    "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=200&q=80",
  desk:
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=200&q=80",
  bed:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=200&q=80",
  chair:
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&w=200&q=80",
} as const;

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
    imageUrl: DEMO_PHOTOS.dresser,
  },
  {
    id: "ikea-pax",
    brand: "IKEA",
    articleId: "791.299.38",
    name: "PAX wardrobe combination",
    icon: "door-open",
    assemblyCents: 12900,
    retailers: ["IKEA"],
    imageUrl: DEMO_PHOTOS.wardrobe,
  },
  {
    id: "ikea-kallax",
    brand: "IKEA",
    articleId: "802.758.87",
    name: "KALLAX shelf unit, 4×4",
    icon: "library",
    assemblyCents: 3900,
    retailers: ["IKEA", "Wayfair"],
    imageUrl: DEMO_PHOTOS.shelf,
  },
  {
    id: "wayfair-desk",
    brand: "Wayfair",
    articleId: "W001234567",
    name: "Mid-century writing desk",
    icon: "table",
    assemblyCents: DEFAULT_ASSEMBLY_CENTS,
    retailers: ["Wayfair", "Amazon"],
    imageUrl: DEMO_PHOTOS.desk,
  },
  {
    id: "target-bed",
    brand: "Target",
    articleId: "TG-88291",
    name: "Queen platform bed frame",
    icon: "bed-double",
    assemblyCents: 6900,
    retailers: ["Target", "Walmart"],
    imageUrl: DEMO_PHOTOS.bed,
  },
  {
    id: "amazon-chair",
    brand: "Amazon",
    articleId: "B0EXAMPLE",
    name: "Ergonomic office chair",
    icon: "armchair",
    assemblyCents: 3500,
    retailers: ["Amazon", "Walmart"],
    imageUrl: DEMO_PHOTOS.chair,
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
    photoDataUrl: p.imageUrl,
  };
}
