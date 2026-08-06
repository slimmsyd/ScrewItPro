import { describe, expect, it } from "vitest";
import {
  ADMIN_NAV,
  adminActiveKey,
  ADMIN_SHELL_HOME,
} from "@/components/admin/adminNav";

describe("adminNav progressive shipping", () => {
  it("only Settings and Leads are shipped in Slice 0-1", () => {
    const shipped = ADMIN_NAV.filter((n) => n.shipped).map((n) => n.key);
    expect(shipped.sort()).toEqual(["leads", "settings"].sort());
  });

  it("home is Settings", () => {
    expect(ADMIN_SHELL_HOME).toBe("/admin/settings");
  });

  it("maps pathnames to active keys", () => {
    expect(adminActiveKey("/admin/settings")).toBe("settings");
    expect(adminActiveKey("/admin/leads")).toBe("leads");
    expect(adminActiveKey("/admin/orders")).toBe("orders");
    expect(adminActiveKey("/admin")).toBe("settings");
  });

  it("does not mark board/schedule as shipped", () => {
    for (const key of ["board", "schedule", "overview"] as const) {
      expect(ADMIN_NAV.find((n) => n.key === key)?.shipped).toBe(false);
    }
  });
});
