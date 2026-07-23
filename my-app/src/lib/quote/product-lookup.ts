import { load } from "cheerio";
import { safeFetch } from "@/lib/http/safe-fetch";
import { resolveAssemblyFeeForLookup } from "@/lib/quote/assembly-fee";
import type { QuoteItem } from "@/lib/quote/types";

export type Retailer = "IKEA" | "Target" | "Other";

export type LookupResult = {
  name: string;
  brand?: string;
  description?: string;
  image?: string;
  priceCents?: number;
  sourceUrl: string;
  retailer: Retailer;
};

export type LookupFailureReason = "invalid_url" | "blocked_host" | "fetch_failed" | "parse_failed";

export type LookupOutcome =
  | { ok: true; result: LookupResult }
  | { ok: false; reason: LookupFailureReason; message: string };

const FETCH_FAILURE_MESSAGES: Record<string, string> = {
  timeout: "That page took too long to load. Try again.",
  too_large: "That page was too large to read.",
  http_error: "That store didn't return the page we asked for. Double-check the link.",
  network_error: "We couldn't load that page. Double-check the link and try again.",
  too_many_redirects: "That link redirected too many times. Try pasting the final product page URL.",
};

export function inferRetailer(hostname: string): Retailer {
  const host = hostname.toLowerCase();
  if (host.includes("ikea.")) return "IKEA";
  if (host.includes("target.")) return "Target";
  return "Other";
}

type JsonLdNode = Record<string, unknown>;

function isProductNode(node: unknown): node is JsonLdNode {
  if (!node || typeof node !== "object") return false;
  const type = (node as JsonLdNode)["@type"];
  if (typeof type === "string") return type === "Product";
  if (Array.isArray(type)) return type.includes("Product");
  return false;
}

/** JSON-LD product blocks come as a bare object, an array, or `{"@graph": [...]}` — flatten all shapes into candidate nodes. */
function flattenJsonLd(parsed: unknown): JsonLdNode[] {
  if (Array.isArray(parsed)) return parsed.flatMap(flattenJsonLd);
  if (parsed && typeof parsed === "object") {
    const graph = (parsed as JsonLdNode)["@graph"];
    if (Array.isArray(graph)) return graph.flatMap(flattenJsonLd);
    return [parsed as JsonLdNode];
  }
  return [];
}

function firstImageUrl(image: unknown): string | undefined {
  if (typeof image === "string") return image;
  if (Array.isArray(image)) return firstImageUrl(image[0]);
  if (image && typeof image === "object") {
    const obj = image as JsonLdNode;
    if (typeof obj.contentUrl === "string") return obj.contentUrl;
    if (typeof obj.url === "string") return obj.url;
  }
  return undefined;
}

function brandName(brand: unknown): string | undefined {
  if (typeof brand === "string") return brand;
  if (brand && typeof brand === "object" && typeof (brand as JsonLdNode).name === "string") {
    return (brand as JsonLdNode).name as string;
  }
  return undefined;
}

function offerPrice(offers: unknown): string | undefined {
  const offer = Array.isArray(offers) ? offers[0] : offers;
  if (!offer || typeof offer !== "object") return undefined;
  const o = offer as JsonLdNode;
  if (typeof o.price === "string" || typeof o.price === "number") return String(o.price);
  const spec = o.priceSpecification;
  if (spec && typeof spec === "object" && "price" in spec) {
    const p = (spec as JsonLdNode).price;
    if (typeof p === "string" || typeof p === "number") return String(p);
  }
  return undefined;
}

function priceStringToCents(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(cleaned);
  if (Number.isNaN(value)) return undefined;
  return Math.round(value * 100);
}

export async function lookupProduct(url: string): Promise<LookupOutcome> {
  try {
    new URL(url);
  } catch {
    return { ok: false, reason: "invalid_url", message: "That doesn't look like a valid link." };
  }

  const fetched = await safeFetch(url);
  if (!fetched.ok) {
    if (fetched.reason === "invalid_url" || fetched.reason === "blocked_host") {
      return {
        ok: false,
        reason: fetched.reason,
        message:
          fetched.reason === "blocked_host"
            ? "That link isn't allowed. Paste a public product page URL."
            : "That doesn't look like a valid link.",
      };
    }
    return {
      ok: false,
      reason: "fetch_failed",
      message: FETCH_FAILURE_MESSAGES[fetched.reason] ?? "We couldn't load that page. Try again.",
    };
  }

  const $ = load(fetched.body);

  let name: string | undefined;
  let brand: string | undefined;
  let description: string | undefined;
  let image: string | undefined;
  let priceCents: number | undefined;

  // Step 1: schema.org/Product JSON-LD
  $('script[type="application/ld+json"]').each((_, el) => {
    if (name) return; // first valid Product node wins
    let parsed: unknown;
    try {
      parsed = JSON.parse($(el).text());
    } catch {
      return;
    }
    const product = flattenJsonLd(parsed).find(isProductNode);
    if (!product) return;
    if (typeof product.name === "string") name = product.name;
    brand = brandName(product.brand);
    if (typeof product.description === "string") description = product.description;
    image = firstImageUrl(product.image);
    priceCents = priceStringToCents(offerPrice(product.offers));
  });

  // Step 2: Open Graph fallback for whatever step 1 didn't find. Gated on
  // og:type === "product" — without this, any page with an og:title (i.e.
  // nearly every page on the internet, including a retailer's own homepage)
  // would be accepted as "a product." Confirmed via real pages: product
  // pages declare og:type="product"; a homepage declared og:type="article".
  const isOgProduct = $('meta[property="og:type"]').attr("content") === "product";
  if (!name && isOgProduct) name = $('meta[property="og:title"]').attr("content");
  if (!description && isOgProduct) description = $('meta[property="og:description"]').attr("content");
  if (!image && isOgProduct) image = $('meta[property="og:image"]').attr("content");
  if (priceCents === undefined && isOgProduct) {
    const ogPrice =
      $('meta[property="og:price:amount"]').attr("content") ??
      $('meta[property="product:price:amount"]').attr("content");
    priceCents = priceStringToCents(ogPrice);
  }

  if (!name) {
    return {
      ok: false,
      reason: "parse_failed",
      message: "We couldn't find product details on that page. Try our catalog search instead.",
    };
  }

  const retailer = inferRetailer(new URL(fetched.finalUrl).hostname);

  return {
    ok: true,
    result: {
      name,
      brand,
      description,
      image,
      priceCents,
      sourceUrl: fetched.finalUrl,
      retailer,
    },
  };
}

const RETAILER_ICONS: Record<Retailer, string> = {
  IKEA: "archive",
  Target: "shopping-bag",
  Other: "shopping-bag",
};

export function lookupResultToQuoteItem(result: LookupResult): QuoteItem {
  return {
    id: `hub-lookup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    brand: result.brand ?? result.retailer,
    name: result.name,
    icon: RETAILER_ICONS[result.retailer],
    assemblyCents: resolveAssemblyFeeForLookup(result),
    src: "hub",
    quantity: 1,
    taskDetails: result.description,
    photoDataUrl: result.image,
  };
}
