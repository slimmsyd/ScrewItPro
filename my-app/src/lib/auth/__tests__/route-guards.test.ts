import { describe, expect, it } from "vitest";
import {
  decideRouteAccess,
  isPublicPath,
  quotePathsStayPublic,
} from "@/lib/auth/route-guards";

describe("quote paths stay public (Slice 2.0)", () => {
  it("allows anonymous access to entire /quote tree", () => {
    const paths = [
      "/quote",
      "/quote/where",
      "/quote/items",
      "/quote/price",
    ];
    for (const p of paths) {
      expect(quotePathsStayPublic(p)).toBe(true);
      expect(isPublicPath(p)).toBe(true);
      expect(
        decideRouteAccess({
          pathname: p,
          authenticated: false,
          role: "customer",
          status: "active",
        }).action
      ).toBe("allow");
    }
  });

  it("does not treat /customer as public", () => {
    expect(isPublicPath("/customer/jobs")).toBe(false);
    expect(
      decideRouteAccess({
        pathname: "/customer/jobs",
        authenticated: false,
        role: "customer",
        status: "active",
      })
    ).toEqual({ action: "login", returnTo: "/customer/jobs" });
  });
});
