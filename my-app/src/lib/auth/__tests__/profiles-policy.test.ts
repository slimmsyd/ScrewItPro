import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Profiles policy recursion regression (Slice 2.0).
 *
 * Forbidden pattern: UPDATE policy on profiles that subqueries profiles
 * for role/status/points pins — becomes a cycle when admin SELECT is added.
 *
 * The fix migration must use security definer is_admin() and a pin trigger
 * instead of WITH CHECK subqueries on profiles.
 */
describe("profiles_update_own recursion guard", () => {
  const migrationPath = join(
    process.cwd(),
    "supabase/migrations/20260730120000_profiles_update_own_no_recursion.sql"
  );

  it("ships a migration that avoids recursive WITH CHECK subqueries", () => {
    const sql = readFileSync(migrationPath, "utf8");

    // Must define security definer helper
    expect(sql).toMatch(/is_admin\(\)/i);
    expect(sql).toMatch(/security definer/i);

    // Must pin privileged columns via trigger, not self-select in WITH CHECK
    expect(sql).toMatch(/profiles_pin_privileged/i);

    // The new update policy should not contain the old recursive pattern
    const updatePolicySection = sql.slice(
      sql.indexOf('create policy "profiles_update_own"')
    );
    const policyBody = updatePolicySection.slice(0, 500);
    expect(policyBody).not.toMatch(
      /role\s*=\s*\(\s*select\s+p\.role\s+from\s+public\.profiles/i
    );
    expect(policyBody).toMatch(/auth\.uid\(\)\s*=\s*id/);
  });

  it("foundation migration documents the old landmine (historical)", () => {
    const foundation = readFileSync(
      join(
        process.cwd(),
        "supabase/migrations/20260709140000_foundation_schema.sql"
      ),
      "utf8"
    );
    // Old pattern existed — we don't edit applied migrations
    expect(foundation).toMatch(/profiles_update_own/);
  });
});
