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
  subtotalCents: number;
  depositCents: number;
  balanceCents: number;
  itemCount: number;
};

export const EMPTY_DRAFT: QuoteDraft = {
  pickupAddress: null,
  deliveryAddress: null,
  shipToHub: true,
  pickupMode: "ship",
  entryMode: "buy",
  items: [],
};

/** Default hub placeholder when customer ships boxes to ScrewIt. */
export const SCREWIT_HUB_PLACE: ResolvedPlace = {
  placeId: "screwit-hub-houston",
  name: "ScrewIt Pros Hub",
  formattedAddress: "ScrewIt Pros Hub · Houston Metro",
  lat: 29.7604,
  lng: -95.3698,
  city: "Houston",
  state: "TX",
  inServiceArea: true,
};
