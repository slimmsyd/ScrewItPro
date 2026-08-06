import { describe, expect, it } from "vitest";
import {
  adminSettingsSchema,
  coverageFor,
  DEFAULT_DEPOSIT_PERCENT,
  DEFAULT_OPS,
  DEFAULT_RADIUS_MILES,
} from "@/lib/admin/settings";

describe("adminSettingsSchema", () => {
  it("accepts product defaults (30% deposit, 40 mi hub) + ops", () => {
    const s = adminSettingsSchema.parse({
      deposit_percent: DEFAULT_DEPOSIT_PERCENT,
      hub: {
        address: "Houston, TX",
        radius_miles: DEFAULT_RADIUS_MILES,
      },
      ops: DEFAULT_OPS,
    });
    expect(s.deposit_percent).toBe(30);
    expect(s.hub.radius_miles).toBe(40);
    expect(s.ops.closedDays).toContain("Sun");
    expect(s.ops.durations.build).toBe(120);
  });

  it("rejects deposit below 5%", () => {
    const r = adminSettingsSchema.safeParse({
      deposit_percent: 2,
      hub: { address: "x", radius_miles: 40 },
      ops: DEFAULT_OPS,
    });
    expect(r.success).toBe(false);
  });
});

describe("coverageFor (Model 1 free zone)", () => {
  const tiers = [
    { to: 15, fee: 0 },
    { to: 40, fee: 20 },
  ];

  it("outside radius: still ok with farFee", () => {
    const c = coverageFor(50, 40, tiers, 45, []);
    expect(c.ok).toBe(true);
    if (c.ok) expect(c.fee).toBe(45);
  });

  it("inside radius: $0 even when tiers would charge", () => {
    const c = coverageFor(20, 40, tiers, 45, []);
    expect(c.ok).toBe(true);
    if (c.ok) expect(c.fee).toBe(0);
  });

  it("near hub: zero fee", () => {
    const c = coverageFor(10, 40, tiers, 45, []);
    expect(c.ok).toBe(true);
    if (c.ok) expect(c.fee).toBe(0);
  });
});
