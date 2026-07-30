import type { MockOrder } from "./types";

/**
 * Design-handoff fixtures for post-book UI.
 * - SIP-4471: confirmation happy path (status = booked)
 * - SIP-WORK: tracker / dashboard hero parity (status = in_workshop)
 * - SIP-4390 / SIP-4188: past (delivered) jobs for My Jobs Past tab
 *
 * Lookup is case-insensitive on the public display id.
 */
/**
 * Demo product image (stable Unsplash furniture photo — not IKEA CDN).
 * Real bookings override this via booked snapshot / quote draft imageUrl.
 */
const DEMO_ITEM_IMAGE =
  "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=200&q=80";
const DEMO_BED_IMAGE =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=200&q=80";
const DEMO_BOOKCASE_IMAGE =
  "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=200&q=80";

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
    items: [
      {
        name: "HEMNES 8-drawer dresser",
        quantity: 1,
        fulfillmentLabel: "Ship to hub",
        imageUrl: DEMO_ITEM_IMAGE,
      },
    ],
    depositCents: 2970,
    balanceCents: 6930,
    deliveryLine: "Yale St, 77008",
    nextStep: baseNextStep,
    sourceLabel: "Ship to hub",
    bookedAtLabel: "Booked Jul 21",
    totalCents: 9900,
    iconName: "Archive",
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
    sourceLabel: "Ship to hub",
    bookedAtLabel: "Booked Jul 18",
    totalCents: 9900,
    iconName: "Archive",
  },
  "SIP-4390": {
    id: "SIP-4390",
    email: "morgan@email.com",
    status: "delivered",
    statusUpdatedAt: new Date("2026-06-14T16:00:00.000Z").toISOString(),
    items: [
      {
        name: "MALM bed frame + 2 nightstands",
        quantity: 3,
        fulfillmentLabel: "Store pickup · IKEA",
        imageUrl: DEMO_BED_IMAGE,
      },
    ],
    depositCents: 5610,
    balanceCents: 0,
    deliveryLine: "Yale St, 77008",
    nextStep: {
      title: "Enjoy your furniture",
      body: "Delivered and placed.",
    },
    sourceLabel: "Store pickup · IKEA",
    bookedAtLabel: "Delivered Jun 14",
    totalCents: 18700,
    iconName: "BedDouble",
  },
  "SIP-4188": {
    id: "SIP-4188",
    email: "morgan@email.com",
    status: "delivered",
    statusUpdatedAt: new Date("2026-05-02T16:00:00.000Z").toISOString(),
    items: [
      {
        name: "BILLY bookcase ×2",
        quantity: 2,
        fulfillmentLabel: "Pickup from home",
        imageUrl: DEMO_BOOKCASE_IMAGE,
      },
    ],
    depositCents: 3540,
    balanceCents: 0,
    deliveryLine: "Yale St, 77008",
    nextStep: {
      title: "Enjoy your furniture",
      body: "Delivered and placed.",
    },
    sourceLabel: "Pickup from home",
    bookedAtLabel: "Delivered May 2",
    totalCents: 11800,
    iconName: "Library",
  },
};

export function getMockOrder(id: string): MockOrder | null {
  const key = id.trim().toUpperCase();
  return MOCK_ORDERS[key] ?? null;
}

export function listMockOrderIds(): string[] {
  return Object.keys(MOCK_ORDERS);
}
