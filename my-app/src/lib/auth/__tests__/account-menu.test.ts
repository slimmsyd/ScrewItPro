import { describe, expect, it } from "vitest";
import { accountMenuFor, roleLabel } from "@/lib/auth/account-menu";
import { ADMIN_HOME_PATH, CUSTOMER_JOBS_PATH } from "@/lib/site";

describe("accountMenuFor", () => {
  it("customer menu is customer-portal links only", () => {
    const m = accountMenuFor("customer");
    expect(m.roleLabel).toBe("Customer");
    const hrefs = m.sections.flatMap((s) =>
      s.items.filter((i) => i.kind === "link").map((i) => i.href)
    );
    expect(hrefs[0]).toBe(CUSTOMER_JOBS_PATH);
    expect(hrefs.some((h) => h.startsWith("/admin"))).toBe(false);
  });

  it("admin menu leads with admin home and keeps customer secondary", () => {
    const m = accountMenuFor("admin");
    expect(m.roleLabel).toBe("Admin");
    const adminSection = m.sections[0]!;
    expect(adminSection.title).toBe("Admin");
    const first = adminSection.items.find((i) => i.kind === "link");
    expect(first && first.kind === "link" && first.href).toBe(ADMIN_HOME_PATH);

    const customer = m.sections.find((s) => s.title === "Customer");
    expect(customer).toBeTruthy();
    const jobs = customer!.items.find(
      (i) => i.kind === "link" && i.href === CUSTOMER_JOBS_PATH
    );
    expect(jobs).toBeTruthy();
  });

  it("technician menu is a note, not fake board links", () => {
    const m = accountMenuFor("technician");
    expect(m.roleLabel).toBe("Technician");
    const notes = m.sections.flatMap((s) =>
      s.items.filter((i) => i.kind === "note")
    );
    expect(notes.length).toBeGreaterThan(0);
    const links = m.sections.flatMap((s) =>
      s.items.filter((i) => i.kind === "link")
    );
    expect(links).toHaveLength(0);
  });

  it("roleLabel is Admin for both admin and super display", () => {
    expect(roleLabel("admin", true)).toBe("Admin");
    expect(roleLabel("admin", false)).toBe("Admin");
  });
});
