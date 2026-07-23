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
};
