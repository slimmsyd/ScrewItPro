import { describe, expect, it } from "vitest";
import { computeQuoteTotals } from "@/lib/quote/pricing";
import type { QuoteDraft } from "@/lib/quote/types";
import { EMPTY_DRAFT } from "@/lib/quote/types";

const rates = {
  lat: 29.7604,
  lng: -95.3698,
  radiusMiles: 40,
  farFee: 45,
  exceptions: [] as { zip: string; mode: "surcharge" | "refuse"; why: string }[],
};

function draftWithDelivery(lat: number, lng: number): QuoteDraft {
  return {
    ...EMPTY_DRAFT,
    pickupMode: "ship",
    shipToHub: true,
    deliveryAddress: {
      placeId: "test",
      name: "Test",
      formattedAddress: "Test",
      lat,
      lng,
      state: "TX",
      inServiceArea: true,
    },
    items: [
      {
        id: "1",
        name: "Dresser",
        icon: "box",
        assemblyCents: 4900,
        src: "hub",
      },
    ],
  };
}

describe("computeQuoteTotals travel (Model 1)", () => {
  it("no travel fee near hub", () => {
    const t = computeQuoteTotals(
      draftWithDelivery(rates.lat, rates.lng),
      rates
    );
    expect(t.travelCents).toBe(0);
    expect(t.beyondRadius).toBe(false);
    // assembly 49 + delivery 25
    expect(t.subtotalCents).toBe(4900 + 2500);
  });

  it("adds farFee when delivery is far west of hub", () => {
    // ~50+ mi west-ish
    const t = computeQuoteTotals(draftWithDelivery(29.76, -96.5), rates);
    expect(t.beyondRadius).toBe(true);
    expect(t.travelCents).toBe(4500);
    expect(t.subtotalCents).toBe(4900 + 2500 + 4500);
    // deposit includes travel
    expect(t.depositCents).toBeGreaterThan(0);
    expect(t.depositCents + t.balanceCents).toBe(t.subtotalCents);
    expect(t.travelAllowed).toBe(true);
  });

  it("ZIP refuse zeros payable totals and flags zipRefused", () => {
    const d = draftWithDelivery(rates.lat, rates.lng);
    d.deliveryAddress = {
      ...d.deliveryAddress!,
      zip: "77001",
    };
    const t = computeQuoteTotals(d, {
      ...rates,
      exceptions: [{ zip: "77001", mode: "refuse", why: "no parking" }],
    });
    expect(t.zipRefused).toBe(true);
    expect(t.travelAllowed).toBe(false);
    expect(t.subtotalCents).toBe(0);
    expect(t.depositCents).toBe(0);
  });
});
