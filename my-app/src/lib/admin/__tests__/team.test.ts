import { describe, expect, it } from "vitest";
import {
  canGrantStaffRole,
  inviteMemberSchema,
  isStaffInviteRole,
  normalizeEmail,
  STAFF_INVITE_ROLES,
} from "@/lib/admin/team";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Care@ScrewItPro.com ")).toBe(
      "care@screwitpro.com"
    );
  });
});

describe("isStaffInviteRole", () => {
  it("accepts admin technician driver", () => {
    for (const r of STAFF_INVITE_ROLES) {
      expect(isStaffInviteRole(r)).toBe(true);
    }
  });

  it("rejects customer and junk", () => {
    expect(isStaffInviteRole("customer")).toBe(false);
    expect(isStaffInviteRole("owner")).toBe(false);
    expect(isStaffInviteRole("")).toBe(false);
    expect(isStaffInviteRole(null)).toBe(false);
  });
});

describe("inviteMemberSchema", () => {
  it("parses valid invite", () => {
    const r = inviteMemberSchema.safeParse({
      email: "  Tech@Example.com ",
      role: "technician",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.email).toBe("tech@example.com");
      expect(r.data.role).toBe("technician");
    }
  });

  it("rejects customer role and bad email", () => {
    expect(
      inviteMemberSchema.safeParse({ email: "a@b.com", role: "customer" })
        .success
    ).toBe(false);
    expect(
      inviteMemberSchema.safeParse({ email: "not-an-email", role: "admin" })
        .success
    ).toBe(false);
  });
});

describe("canGrantStaffRole", () => {
  it("only super admin may invite admin", () => {
    expect(
      canGrantStaffRole({ inviterIsSuperAdmin: true, role: "admin" })
    ).toBe(true);
    expect(
      canGrantStaffRole({ inviterIsSuperAdmin: false, role: "admin" })
    ).toBe(false);
  });

  it("any admin inviter may invite field roles", () => {
    expect(
      canGrantStaffRole({ inviterIsSuperAdmin: false, role: "technician" })
    ).toBe(true);
    expect(
      canGrantStaffRole({ inviterIsSuperAdmin: false, role: "driver" })
    ).toBe(true);
    expect(
      canGrantStaffRole({ inviterIsSuperAdmin: true, role: "driver" })
    ).toBe(true);
  });
});
