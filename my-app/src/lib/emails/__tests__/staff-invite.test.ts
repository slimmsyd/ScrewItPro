import { describe, expect, it } from "vitest";
import { staffInvite } from "@/lib/emails/templates";

describe("staffInvite template", () => {
  it("renders branded copy with role and action link", () => {
    const link = "https://example.supabase.co/auth/v1/verify?token=abc";
    const mail = staffInvite({
      inviteUrl: link,
      roleLabel: "Technician",
      inviterEmail: "t.wade@screwitpro.com",
      appName: "ScrewIt Pros",
    });

    expect(mail.code).toBe("staff-invite");
    expect(mail.subject).toContain("Technician");
    expect(mail.html).toContain("Accept invite");
    expect(mail.html).toContain(link);
    expect(mail.html).toContain("t.wade@screwitpro.com");
    expect(mail.text).toContain(link);
    expect(mail.text).toContain("Technician");
  });

  it("works without inviter email", () => {
    const mail = staffInvite({
      inviteUrl: "https://x.test/invite",
      roleLabel: "Admin",
    });
    expect(mail.subject).toContain("Admin");
    expect(mail.html).toContain("You've been invited");
  });
});
