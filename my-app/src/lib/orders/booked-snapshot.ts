import type { QuoteDraft, QuoteItem, QuoteTotals } from "@/lib/quote/types";
import type { MockOrder, MockOrderItem } from "./types";

/**
 * Client-side booking snapshot — bridges quote draft → post-book screens
 * until Stripe + order_items DB persist the same shape.
 *
 * Canonical image field on every line: imageUrl (retailer CDN URL or data URL).
 * All entry modes normalize into QuoteItem.photoDataUrl at add-time; we map
 * that here once so confirmation/tracker never re-fetch IKEA.
 */
export const BOOKED_SNAPSHOT_KEY = "screwitpro_booked_snapshot_v1";

export type BookedSnapshotItem = {
  name: string;
  quantity: number;
  fulfillmentLabel: string;
  /** Retailer CDN (IKEA/Target) or upload data URL — optional */
  imageUrl?: string;
};

export type BookedSnapshot = {
  orderId: string;
  email?: string;
  items: BookedSnapshotItem[];
  depositCents: number;
  balanceCents: number;
  deliveryLine: string;
  createdAt: string;
};

function fulfillmentLabelForItem(
  item: QuoteItem,
  draft: QuoteDraft
): string {
  if (item.src === "hub") return "Ship to hub";
  if (item.src === "retailer") return item.store ?? "Store pickup";
  if (draft.pickupMode === "pickup") return "Pickup";
  return "Ship to hub";
}

function itemImageUrl(item: QuoteItem): string | undefined {
  const url = item.photoDataUrl?.trim();
  return url ? url : undefined;
}

export function quoteItemsToSnapshotItems(
  draft: QuoteDraft
): BookedSnapshotItem[] {
  return draft.items.map((item) => ({
    name: item.name,
    quantity: Math.max(1, item.quantity ?? 1),
    fulfillmentLabel: fulfillmentLabelForItem(item, draft),
    imageUrl: itemImageUrl(item),
  }));
}

/** Call right before navigating to confirmation (demo or future real book). */
export function saveBookedSnapshot(input: {
  orderId: string;
  draft: QuoteDraft;
  totals: QuoteTotals;
  email?: string;
}): BookedSnapshot {
  const deliveryLine =
    input.draft.deliveryAddress?.formattedAddress?.split(",")[0]?.trim() ||
    input.draft.deliveryAddress?.name ||
    "Your delivery address";

  const snap: BookedSnapshot = {
    orderId: input.orderId,
    email: input.email,
    items: quoteItemsToSnapshotItems(input.draft),
    depositCents: input.totals.depositCents,
    balanceCents: input.totals.balanceCents,
    deliveryLine,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(BOOKED_SNAPSHOT_KEY, JSON.stringify(snap));
    } catch {
      /* quota / private mode — screens fall back to mock fixtures */
    }
  }
  return snap;
}

export function loadBookedSnapshot(): BookedSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(BOOKED_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BookedSnapshot;
    if (!parsed?.orderId || !Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Overlay snapshot line items (incl. images) onto a mock order shell. */
export function applySnapshotToOrder(
  base: MockOrder,
  snap: BookedSnapshot | null
): MockOrder {
  if (!snap) return base;
  // Only apply when snapshot targets this order (or demo SIP ids).
  const snapId = snap.orderId.trim().toUpperCase();
  const baseId = base.id.trim().toUpperCase();
  if (snapId !== baseId && snapId !== "SIP-4471") return base;

  const items: MockOrderItem[] =
    snap.items.length > 0
      ? snap.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          fulfillmentLabel: i.fulfillmentLabel,
          imageUrl: i.imageUrl,
        }))
      : base.items;

  return {
    ...base,
    email: snap.email?.trim() || base.email,
    items,
    depositCents: snap.depositCents || base.depositCents,
    balanceCents: snap.balanceCents || base.balanceCents,
    deliveryLine: snap.deliveryLine || base.deliveryLine,
  };
}
