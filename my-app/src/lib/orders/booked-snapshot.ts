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
/** Same-tab listeners (storage events do not fire in the tab that wrote). */
export const BOOKED_SNAPSHOT_EVENT = "screwitpro:booked-snapshot";

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

/** Normalize relative / protocol-relative retailer URLs to absolute https. */
export function normalizeImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  const t = url.trim();
  if (!t) return undefined;
  if (t.startsWith("//")) return `https:${t}`;
  if (t.startsWith("http://") || t.startsWith("https://") || t.startsWith("data:")) {
    return t;
  }
  // Relative path without a page base — unusable for <img>; drop it.
  if (t.startsWith("/")) return undefined;
  return t;
}

function itemImageUrl(item: QuoteItem): string | undefined {
  return normalizeImageUrl(item.photoDataUrl);
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
      // Notify same-tab subscribers (useDisplayOrder) — StorageEvent is cross-tab only.
      window.dispatchEvent(
        new CustomEvent(BOOKED_SNAPSHOT_EVENT, { detail: { orderId: snap.orderId } })
      );
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

/** Drop client booking snapshot so confirmation/tracker fall back to mock fixtures. */
export function clearBookedSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BOOKED_SNAPSHOT_KEY);
    window.dispatchEvent(
      new CustomEvent(BOOKED_SNAPSHOT_EVENT, { detail: { orderId: null } })
    );
  } catch {
    // ignore
  }
}

/** Overlay snapshot line items (incl. images) onto a mock order shell. */
export function applySnapshotToOrder(
  base: MockOrder,
  snap: BookedSnapshot | null
): MockOrder {
  if (!snap) return base;
  // Only apply when snapshot targets this order (demo SIP-4471 is the soft-gate target).
  const snapId = snap.orderId.trim().toUpperCase();
  const baseId = base.id.trim().toUpperCase();
  if (snapId !== baseId) return base;

  const items: MockOrderItem[] =
    snap.items.length > 0
      ? snap.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          fulfillmentLabel: i.fulfillmentLabel,
          imageUrl: normalizeImageUrl(i.imageUrl) ?? undefined,
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

/**
 * Prefer booked snapshot; if missing, synthesize from live quote draft so
 * mid-session tracker/confirmation still show cart images (IKEA paste etc.).
 */
export function resolveDisplayOrder(
  base: MockOrder,
  draft?: QuoteDraft | null
): MockOrder {
  const snap = loadBookedSnapshot();
  if (snap && snap.orderId.trim().toUpperCase() === base.id.trim().toUpperCase()) {
    return applySnapshotToOrder(base, snap);
  }

  // Draft fallback for demo order id only (soft-gate lands on SIP-4471).
  if (draft && draft.items.length > 0 && base.id.trim().toUpperCase() === "SIP-4471") {
    const synthetic: BookedSnapshot = {
      orderId: base.id,
      items: quoteItemsToSnapshotItems(draft),
      depositCents: base.depositCents,
      balanceCents: base.balanceCents,
      deliveryLine:
        draft.deliveryAddress?.formattedAddress?.split(",")[0]?.trim() ||
        base.deliveryLine,
      createdAt: new Date().toISOString(),
    };
    return applySnapshotToOrder(base, synthetic);
  }

  return base;
}
