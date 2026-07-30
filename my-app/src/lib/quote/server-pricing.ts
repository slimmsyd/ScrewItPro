/**
 * Server-only rate card copy for draft orders / checkout.
 * Client may display the same numbers via pricing.ts — never trust client cents.
 */
import {
  DEFAULT_ASSEMBLY_CENTS,
  DELIVERY_CENTS,
  HOME_CATEGORY_CENTS,
  PICKUP_CENTS,
} from "@/lib/quote/pricing";
import type { HomeCategory } from "@/lib/quote/types";
import { computeDepositCents } from "@/lib/payments";

export type DraftLineInput = {
  name: string;
  quantity?: number;
  src?: string;
  category?: string;
  /** Client-submitted assembly — ignored for pricing; re-derived server-side */
  assemblyCents?: number;
};

const HOME_KEYS = new Set(Object.keys(HOME_CATEGORY_CENTS));

function assemblyForLine(line: DraftLineInput): number {
  if (line.src === "home" && line.category && HOME_KEYS.has(line.category)) {
    return HOME_CATEGORY_CENTS[line.category as HomeCategory];
  }
  if (line.src === "retailer") {
    // Store pickup orders — flat default until item_classes
    return DEFAULT_ASSEMBLY_CENTS;
  }
  // hub / lookup / buy — default assembly until item_classes catalog
  return DEFAULT_ASSEMBLY_CENTS;
}

export function priceDraftServerSide(input: {
  items: DraftLineInput[];
  pickupMode?: "pickup" | "ship" | null;
}): {
  assemblyCents: number;
  pickupCents: number;
  deliveryCents: number;
  subtotalCents: number;
  depositCents: number;
  balanceCents: number;
  lineCount: number;
} {
  const items = input.items ?? [];
  const assemblyCents = items.reduce((sum, line) => {
    const qty = Math.max(1, Math.min(99, Math.floor(line.quantity ?? 1)));
    return sum + assemblyForLine(line) * qty;
  }, 0);
  const pickupCents = input.pickupMode === "pickup" ? PICKUP_CENTS : 0;
  const deliveryCents = items.length > 0 ? DELIVERY_CENTS : 0;
  const subtotalCents = assemblyCents + pickupCents + deliveryCents;
  const depositCents =
    subtotalCents > 0 ? computeDepositCents(subtotalCents) : 0;
  const balanceCents = Math.max(0, subtotalCents - depositCents);
  return {
    assemblyCents,
    pickupCents,
    deliveryCents,
    subtotalCents,
    depositCents,
    balanceCents,
    lineCount: items.length,
  };
}
