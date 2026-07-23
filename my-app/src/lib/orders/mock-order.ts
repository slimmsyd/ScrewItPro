import type { MockOrder } from "./types";

/**
 * Design-handoff fixtures for post-book UI.
 * - SIP-4471: confirmation happy path (status = booked)
 * - SIP-WORK: tracker screenshot parity (status = in_workshop)
 *
 * Lookup is case-insensitive on the public display id.
 */
/**
 * Demo product image (stable Unsplash furniture photo — not IKEA CDN).
 * Real bookings override this via booked snapshot / quote draft imageUrl.
 */
const DEMO_ITEM_IMAGE =
  "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=200&q=80";

const baseItems: MockOrder["items"] = [
  {
    name: "HEMNES 8-drawer dresser",
    quantity: 1,
    fulfillmentLabel: "Ship to hub",
    imageUrl: DEMO_ITEM_IMAGE,
  },
];

const baseNextStep = {
  title: "Ship your items to our hub",
  body: "Address & label emailed. We take it from there.",
};

const MOCK_ORDERS: Record<string, MockOrder> = {
  "SIP-4471": {
    id: "SIP-4471",
    email: "morgan@email.com",
    status: "booked",
    // ~2h ago for demo "updated 2h ago" when viewing as active
    statusUpdatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    items: baseItems,
    depositCents: 2970,
    balanceCents: 6930,
    deliveryLine: "Yale St, 77008",
    nextStep: baseNextStep,
  },
  "SIP-WORK": {
    id: "SIP-WORK",
    email: "morgan@email.com",
    status: "in_workshop",
    statusUpdatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        name: "HEMNES dresser",
        quantity: 1,
        fulfillmentLabel: "Ship to hub",
        imageUrl: DEMO_ITEM_IMAGE,
      },
    ],
    depositCents: 2970,
    balanceCents: 6930,
    deliveryLine: "Yale St, 77008",
    nextStep: baseNextStep,
  },
};

export function getMockOrder(id: string): MockOrder | null {
  const key = id.trim().toUpperCase();
  return MOCK_ORDERS[key] ?? null;
}

export function listMockOrderIds(): string[] {
  return Object.keys(MOCK_ORDERS);
}
