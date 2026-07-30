import { describe, expect, it } from "vitest";
import {
  mapDbOrderToPortal,
  mapDbOrdersToPortal,
  type DbOrderRow,
} from "../map-db-order-to-portal";

const baseRow = (overrides: Partial<DbOrderRow> = {}): DbOrderRow => ({
  id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  order_number: "SIP-10042",
  customer_email: "pat@example.com",
  contact_email: "pat@example.com",
  lifecycle_status: "awaiting_arrival",
  total_cents: 25000,
  deposit_cents: 7500,
  balance_cents: 17500,
  created_at: "2026-07-21T15:00:00.000Z",
  updated_at: "2026-07-21T17:00:00.000Z",
  metadata: { deliveryLine: "Yale St, 77008" },
  order_items: [
    {
      name: "HEMNES dresser",
      quantity: 1,
      fulfillment_mode: "warehouse_assembly",
      image_url: "https://example.com/item.jpg",
      sort_order: 0,
    },
  ],
  ...overrides,
});

describe("mapDbOrderToPortal (Phase C2)", () => {
  it("maps awaiting_arrival → booked with order_number as display id", () => {
    const job = mapDbOrderToPortal(baseRow());
    expect(job).not.toBeNull();
    expect(job!.id).toBe("SIP-10042");
    expect(job!.status).toBe("booked");
    expect(job!.email).toBe("pat@example.com");
    expect(job!.depositCents).toBe(7500);
    expect(job!.balanceCents).toBe(17500);
    expect(job!.totalCents).toBe(25000);
    expect(job!.deliveryLine).toBe("Yale St, 77008");
    expect(job!.items[0]?.name).toBe("HEMNES dresser");
    expect(job!.items[0]?.fulfillmentLabel).toBe("Ship to hub");
    expect(job!.items[0]?.imageUrl).toBe("https://example.com/item.jpg");
    expect(job!.sourceLabel).toBe("Ship to hub");
    expect(job!.nextStep.title).toMatch(/Ship/i);
    expect(job!.bookedAtLabel).toMatch(/Booked/);
  });

  it("maps in_assembly → in_workshop and delivered → delivered", () => {
    expect(
      mapDbOrderToPortal(baseRow({ lifecycle_status: "in_assembly" }))!.status
    ).toBe("in_workshop");
    expect(
      mapDbOrderToPortal(baseRow({ lifecycle_status: "delivered" }))!.status
    ).toBe("delivered");
  });

  it("returns null for pre-book and cancelled lifecycles", () => {
    expect(mapDbOrderToPortal(baseRow({ lifecycle_status: "draft" }))).toBeNull();
    expect(
      mapDbOrderToPortal(baseRow({ lifecycle_status: "pending_quote" }))
    ).toBeNull();
    expect(
      mapDbOrderToPortal(baseRow({ lifecycle_status: "cancelled_no_payment" }))
    ).toBeNull();
  });

  it("falls back to uuid when order_number missing", () => {
    const job = mapDbOrderToPortal(
      baseRow({ order_number: null, id: "uuid-only-id" })
    );
    expect(job!.id).toBe("uuid-only-id");
  });

  it("filters a mixed list to visible jobs only", () => {
    const jobs = mapDbOrdersToPortal([
      baseRow({ order_number: "SIP-1", lifecycle_status: "awaiting_arrival" }),
      baseRow({ order_number: "SIP-2", lifecycle_status: "draft" }),
      baseRow({
        order_number: "SIP-3",
        lifecycle_status: "delivered",
        created_at: "2026-06-14T12:00:00.000Z",
      }),
    ]);
    expect(jobs.map((j) => j.id)).toEqual(["SIP-1", "SIP-3"]);
    expect(jobs[1]!.status).toBe("delivered");
  });

  it("provides a placeholder item when order_items empty", () => {
    const job = mapDbOrderToPortal(baseRow({ order_items: [] }));
    expect(job!.items).toHaveLength(1);
    expect(job!.items[0]!.name).toBe("Your build");
  });
});
