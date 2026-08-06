import type { ResolvedPlace } from "@/lib/places";

export type PickupMode = "ship" | "pickup";
export type EntryMode = "buy" | "home" | "store";
export type ItemSource = "hub" | "home" | "retailer";

export type HomeCategory =
  | "bed"
  | "dresser"
  | "table"
  | "shelf"
  | "chair"
  | "other";

export type QuoteItem = {
  id: string;
  brand?: string;
  name: string;
  /** Lucide icon name or category key */
  icon: string;
  assemblyCents: number;
  src: ItemSource;
  articleId?: string;
  quantity?: number;
  taskDetails?: string;
  category?: HomeCategory;
  store?: string;
  orderNumber?: string;
  nameOnOrder?: string;
  storeLocation?: string;
  readyByDate?: string;
  photoDataUrl?: string;
};

export type QuoteDraft = {
  pickupAddress: ResolvedPlace | null;
  deliveryAddress: ResolvedPlace | null;
  /** When ship mode, pickup can be hub placeholder */
  shipToHub: boolean;
  pickupMode: PickupMode;
  entryMode: EntryMode;
  items: QuoteItem[];
};

export type QuoteTotals = {
  assemblyCents: number;
  pickupCents: number;
  deliveryCents: number;
  /**
   * Out-of-area travel only (Model 1). $0 inside hub radius.
   * Included in subtotal before deposit % (Stripe deposit base).
   */
  travelCents: number;
  /** Human label for breakdown when travelCents > 0. */
  travelLabel: string;
  /** True when delivery is outside hub free zone. */
  beyondRadius: boolean;
  /** Straight-line miles from hub to delivery (0 if unknown). */
  travelMiles: number;
  /** False when ZIP refuse (or other hard travel block). */
  travelAllowed: boolean;
  /** True when delivery ZIP is in ops refuse list. */
  zipRefused: boolean;
  subtotalCents: number;
  depositCents: number;
  balanceCents: number;
  itemCount: number;
};

export const EMPTY_DRAFT: QuoteDraft = {
  pickupAddress: null,
  deliveryAddress: null,
  shipToHub: false,
  /** Default to editable dual addresses; user can switch to ship-to-hub. */
  pickupMode: "pickup",
  entryMode: "buy",
  items: [],
};

/**
 * Stable placeId for "ship to hub" mode (not a Google place id).
 * Display address comes from Admin Settings via service-area config at runtime.
 */
export const SCREWIT_HUB_PLACE_ID = "screwit-hub-houston";

/** Fallback hub place when public config is unavailable. */
export const SCREWIT_HUB_PLACE: ResolvedPlace = {
  placeId: SCREWIT_HUB_PLACE_ID,
  name: "ScrewIt Pros Hub",
  formattedAddress: "ScrewIt Pros Hub · Houston Metro",
  lat: 29.7604,
  lng: -95.3698,
  city: "Houston",
  state: "TX",
  inServiceArea: true,
};

/** Build the ship-to-hub place from live Admin hub config. */
export function hubPlaceFromServiceArea(area: {
  address: string;
  lat: number;
  lng: number;
}): ResolvedPlace {
  const address = area.address.trim() || SCREWIT_HUB_PLACE.formattedAddress;
  return {
    placeId: SCREWIT_HUB_PLACE_ID,
    name: "ScrewIt Pros Hub",
    formattedAddress: address,
    lat: area.lat,
    lng: area.lng,
    city: "Houston",
    state: "TX",
    inServiceArea: true,
  };
}
