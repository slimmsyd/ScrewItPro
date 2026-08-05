import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  decideRouteAccess,
  isPublicPath,
  PUBLIC_ADMIN_LEAVES,
} from "../route-guards";
import { isSuperAdminEmail } from "../require-admin";
import { ADMIN_SIGNIN_PATH } from "@/lib/site";

/**
 * These pin two things that are easy to break and expensive to notice:
 * the admin door staying reachable when signed out, and the rest of /admin
 * staying shut.
 */

describe("admin sign-in reachability", () => {
  it("is public — a signed-out admin must be able to load their own door", () => {
    expect(isPublicPath(ADMIN_SIGNIN_PATH)).toBe(true);
    expect(
      decideRouteAccess({
        pathname: ADMIN_SIGNIN_PATH,
        authenticated: false,
        role: "customer",
        status: "active",
      })
    ).toEqual({ action: "allow" });
  });

  it("does not open the rest of /admin to anonymous visitors", () => {
    for (const path of ["/admin", "/admin/leads", "/admin/email-templates"]) {
      expect(isPublicPath(path)).toBe(false);
      expect(
        decideRouteAccess({
          pathname: path,
          authenticated: false,
          role: "customer",
          status: "active",
        }).action
      ).toBe("login");
    }
  });

  it("does not leak via prefix — /admin/signin-something stays gated", () => {
    expect(isPublicPath("/admin/signin-x")).toBe(false);
    expect(isPublicPath("/admin/signin/extra")).toBe(false);
  });

  it("keeps the site constant and the guard list in sync", () => {
    expect(PUBLIC_ADMIN_LEAVES).toContain(ADMIN_SIGNIN_PATH);
  });

  it("still sends a signed-in non-admin through to a real 403, not a login loop", () => {
    expect(
      decideRouteAccess({
        pathname: "/admin/leads",
        authenticated: true,
        role: "customer",
        status: "active",
      })
    ).toEqual({ action: "allow" });
  });
});

/**
 * SUPER_ADMIN_EMAILS is an exact-match list, deliberately not a domain match:
 * one entry must never imply access for everyone sharing that domain.
 */
describe("super admin allowlist", () => {
  const ORIGINAL = process.env.SUPER_ADMIN_EMAILS;

  beforeEach(() => {
    process.env.SUPER_ADMIN_EMAILS = "care@screwitpro.com";
  });
  afterEach(() => {
    process.env.SUPER_ADMIN_EMAILS = ORIGINAL;
  });

  it("matches an allowlisted address, case- and space-insensitively", () => {
    expect(isSuperAdminEmail("care@screwitpro.com")).toBe(true);
    expect(isSuperAdminEmail("  CARE@ScrewItPro.COM  ")).toBe(true);
  });

  it("does NOT grant the rest of the domain", () => {
    expect(isSuperAdminEmail("someone@screwitpro.com")).toBe(false);
    expect(isSuperAdminEmail("attacker@screwitpro.com")).toBe(false);
  });

  it("supports several addresses and refuses empties", () => {
    process.env.SUPER_ADMIN_EMAILS = "care@screwitpro.com, dev@example.com";
    expect(isSuperAdminEmail("dev@example.com")).toBe(true);
    expect(isSuperAdminEmail("care@screwitpro.com")).toBe(true);
    expect(isSuperAdminEmail("")).toBe(false);
    expect(isSuperAdminEmail(null)).toBe(false);
  });
});
