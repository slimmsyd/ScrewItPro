import { describe, expect, it } from "vitest";
import { BUSINESS } from "@/lib/seo/business";
import {
  defaultsFromBusiness,
  isInServiceArea,
  milesToMeters,
  normalizeHub,
} from "@/lib/config/service-area";

describe("service-area config", () => {
  it("defaults match BUSINESS.geo (40 mi product lock as fallback)", () => {
    const d = defaultsFromBusiness();
    expect(d.radiusMiles).toBe(40);
    expect(d.radiusM).toBe(BUSINESS.geo.radiusM);
    expect(d.lat).toBe(BUSINESS.geo.lat);
    expect(d.lng).toBe(BUSINESS.geo.lng);
    expect(d.farFee).toBe(45);
  });

  it("normalizeHub computes radius_m from miles", () => {
    const c = normalizeHub({
      address: "4120 Lockwood Dr, Houston, TX",
      radius_miles: 15,
      lat: 29.76,
      lng: -95.37,
    });
    expect(c.radiusMiles).toBe(15);
    expect(c.radiusM).toBe(milesToMeters(15));
    expect(c.address).toContain("Lockwood");
  });

  it("normalizeHub falls back on empty raw", () => {
    expect(normalizeHub(null).radiusMiles).toBe(40);
  });

  it("isInServiceArea refuses non-TX", () => {
    const c = defaultsFromBusiness();
    expect(isInServiceArea(29.76, -95.37, "CA", c)).toBe(false);
  });

  it("isInServiceArea true near hub, false far with small radius", () => {
    const tight = normalizeHub({
      radius_miles: 5,
      lat: BUSINESS.geo.lat,
      lng: BUSINESS.geo.lng,
    });
    // Downtown itself
    expect(
      isInServiceArea(BUSINESS.geo.lat, BUSINESS.geo.lng, "TX", tight)
    ).toBe(true);
    // ~50 miles west-ish (rough)
    expect(isInServiceArea(29.76, -96.5, "TX", tight)).toBe(false);
  });
});
