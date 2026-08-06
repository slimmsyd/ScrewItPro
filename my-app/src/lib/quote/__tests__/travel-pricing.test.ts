import { describe, expect, it } from "vitest";
import {
  coverageFromTravelPricing,
  evaluateTravelPricing,
  type TravelException,
} from "@/lib/quote/travel-pricing";

const radius = 40;
const farFee = 45;
/** Tiers must NOT affect Model 1 customer fee. */
const tiers = [
  { to: 15, fee: 0 },
  { to: 40, fee: 20 },
];

describe("evaluateTravelPricing (Model 1 — free zone)", () => {
  it("inside radius: $0 even when tiers would have charged", () => {
    const r = evaluateTravelPricing({
      miles: 25,
      radiusMiles: radius,
      tiers,
      farFee,
      exceptions: [],
    });
    expect(r.allowed).toBe(true);
    expect(r.fee).toBe(0);
    expect(r.feeCents).toBe(0);
    expect(r.band).toBe("in_zone");
    expect(r.beyondRadius).toBe(false);
  });

  it("at exact radius: still free (not beyond)", () => {
    const r = evaluateTravelPricing({
      miles: 40,
      radiusMiles: radius,
      tiers,
      farFee,
      exceptions: [],
    });
    expect(r.allowed).toBe(true);
    expect(r.fee).toBe(0);
    expect(r.band).toBe("in_zone");
    expect(r.beyondRadius).toBe(false);
  });

  it("near hub: $0", () => {
    const r = evaluateTravelPricing({
      miles: 5,
      radiusMiles: radius,
      tiers,
      farFee,
      exceptions: [],
    });
    expect(r.fee).toBe(0);
    expect(r.band).toBe("in_zone");
  });

  it("outside radius: bookable with farFee", () => {
    const r = evaluateTravelPricing({
      miles: 50,
      radiusMiles: radius,
      tiers,
      farFee,
      exceptions: [],
    });
    expect(r.allowed).toBe(true);
    expect(r.beyondRadius).toBe(true);
    expect(r.fee).toBe(45);
    expect(r.feeCents).toBe(4500);
    expect(r.band).toBe("beyond_radius");
    expect(r.label).toMatch(/outside 40/i);
    expect(r.label).toMatch(/\+\$45/);
  });

  it("outside radius with zero farFee still allowed", () => {
    const r = evaluateTravelPricing({
      miles: 55,
      radiusMiles: radius,
      tiers,
      farFee: 0,
      exceptions: [],
    });
    expect(r.allowed).toBe(true);
    expect(r.fee).toBe(0);
    expect(r.band).toBe("beyond_radius");
  });

  it("ZIP refuse hard-blocks regardless of miles", () => {
    const exceptions: TravelException[] = [
      { zip: "77001", mode: "refuse", why: "no parking" },
    ];
    const r = evaluateTravelPricing({
      miles: 5,
      radiusMiles: radius,
      tiers,
      farFee,
      exceptions,
      zip: "77001",
    });
    expect(r.allowed).toBe(false);
    expect(r.fee).toBe(0);
    expect(r.band).toBe("zip_refuse");
    expect(r.label).toMatch(/77001/);
  });

  it("ZIP surcharge uses farFee and stays bookable", () => {
    const exceptions: TravelException[] = [
      { zip: "77573", mode: "surcharge", why: "ferry" },
    ];
    const r = evaluateTravelPricing({
      miles: 12,
      radiusMiles: radius,
      tiers,
      farFee,
      exceptions,
      zip: "77573",
    });
    expect(r.allowed).toBe(true);
    expect(r.fee).toBe(45);
    expect(r.band).toBe("zip_surcharge");
  });

  it("ZIP refuse wins over beyond-radius soft wall", () => {
    const exceptions: TravelException[] = [
      { zip: "99999", mode: "refuse", why: "out of market" },
    ];
    const r = evaluateTravelPricing({
      miles: 100,
      radiusMiles: radius,
      tiers,
      farFee,
      exceptions,
      zip: "99999",
    });
    expect(r.allowed).toBe(false);
    expect(r.band).toBe("zip_refuse");
    expect(r.beyondRadius).toBe(true);
  });

  it("clamps invalid miles to 0", () => {
    const r = evaluateTravelPricing({
      miles: -3,
      radiusMiles: radius,
      tiers,
      farFee,
      exceptions: [],
    });
    expect(r.fee).toBe(0);
    expect(r.band).toBe("in_zone");
  });

  it("matches ZIP+4 against 5-digit exception", () => {
    const r = evaluateTravelPricing({
      miles: 5,
      radiusMiles: radius,
      farFee,
      exceptions: [{ zip: "77001", mode: "refuse", why: "x" }],
      zip: "77001-1234",
    });
    expect(r.allowed).toBe(false);
    expect(r.band).toBe("zip_refuse");
  });
});

describe("coverageFromTravelPricing", () => {
  it("maps beyond radius to ok + farFee", () => {
    const r = evaluateTravelPricing({
      miles: 50,
      radiusMiles: 40,
      farFee: 45,
    });
    const c = coverageFromTravelPricing(r);
    expect(c.ok).toBe(true);
    if (c.ok) expect(c.fee).toBe(45);
  });

  it("maps in-zone to ok + $0", () => {
    const r = evaluateTravelPricing({
      miles: 20,
      radiusMiles: 40,
      farFee: 45,
      tiers,
    });
    const c = coverageFromTravelPricing(r);
    expect(c.ok).toBe(true);
    if (c.ok) expect(c.fee).toBe(0);
  });

  it("maps refuse to ok: false", () => {
    const r = evaluateTravelPricing({
      miles: 5,
      radiusMiles: 40,
      farFee: 45,
      exceptions: [{ zip: "77001", mode: "refuse", why: "" }],
      zip: "77001",
    });
    const c = coverageFromTravelPricing(r);
    expect(c.ok).toBe(false);
  });
});
