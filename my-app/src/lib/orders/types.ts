export type CustomerOrderStatus =
  | "booked"
  | "pickup_scheduled"
  | "picked_up"
  | "in_workshop"
  | "assembled_inspected"
  | "out_for_delivery"
  | "delivered";

export type TimelineNodeState = "done" | "active" | "upcoming";

export type MockOrderItem = {
  name: string;
  quantity: number;
  /** e.g. "Ship to hub" | "Pickup" */
  fulfillmentLabel: string;
  /**
   * Product image when known — IKEA/Target CDN URL from paste-lookup,
   * catalog asset, or future customer upload. Omit → icon fallback.
   */
  imageUrl?: string;
};

export type MockOrder = {
  /** Public display id, e.g. SIP-4471 — also used as route param for mock */
  id: string;
  email: string;
  status: CustomerOrderStatus;
  /** ISO string; used for "updated … ago" on active step */
  statusUpdatedAt: string;
  items: MockOrderItem[];
  depositCents: number;
  balanceCents: number;
  deliveryLine: string;
  nextStep: {
    title: string;
    body: string;
  };
  /**
   * Human source line for list rows ("Ship to hub", "Store pickup · IKEA").
   * Falls back to first item fulfillmentLabel when omitted.
   */
  sourceLabel?: string;
  /** List row date line, e.g. "Booked Jul 21" / "Delivered Jun 14" */
  bookedAtLabel?: string;
  /**
   * Full job price. Delivered fixtures zero out balanceCents, so
   * deposit + balance no longer reconstructs it — set explicitly there.
   */
  totalCents?: number;
  /** lucide-react icon for list-row tiles (design uses icons, not photos) */
  iconName?: "Archive" | "BedDouble" | "Library" | "Package";
};
