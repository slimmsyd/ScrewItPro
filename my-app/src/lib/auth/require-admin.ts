import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";

/** Why an admin gate said no — each maps to its own sign-in screen. */
export type AdminDenyReason =
  | "unauthenticated"
  | "forbidden"
  | "invited"
  | "not_configured";

export type RequireAdminResult =
  | { ok: true; userId: string; email: string; isSuperAdmin: boolean }
  | { ok: false; reason: AdminDenyReason };

/** True when this email is on the server-only super-admin allowlist. */
export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return serverEnv.superAdminEmails.includes(email.trim().toLowerCase());
}

/**
 * Authoritative admin gate — reads profiles.role (not JWT claim alone).
 *
 * Two ways in, on purpose:
 *   SUPER ADMIN (dev)  — email on SUPER_ADMIN_EMAILS. Checked before any DB
 *                        read, so it survives a broken/suspended profiles row.
 *                        Cannot be granted by a database write.
 *   ADMIN (owner)      — profiles.role = 'admin' and status = 'active'.
 *
 * `invited` is distinct from `forbidden`: an account the owner has added but
 * that has not accepted yet gets the "invite waiting" screen, not a refusal.
 *
 * First admin must be promoted via SQL:
 *   update public.profiles set role = 'admin' where email = 'you@…';
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return { ok: false, reason: "not_configured" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { ok: false, reason: "unauthenticated" };
  }

  const email = user.email ?? "";

  // Super admin short-circuits the profile lookup entirely. The whole point of
  // an env allowlist is that it still works when the database does not.
  if (isSuperAdminEmail(email)) {
    return { ok: true, userId: user.id, email, isSuperAdmin: true };
  }

  // Prefer user-scoped client (RLS). If select own works, check role.
  let { data: own, error: ownErr } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  // First visit after invite: flip invited → active while they hold a session.
  if (!ownErr && own?.status === "invited" && own?.role === "admin") {
    try {
      const { activateOwnStaffInvite } = await import("@/lib/admin/team");
      await activateOwnStaffInvite(supabase);
      const again = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", user.id)
        .maybeSingle();
      if (!again.error && again.data) {
        own = again.data;
      }
    } catch {
      /* keep invited */
    }
  }

  if (!ownErr && own) {
    return resolveProfile(own.role, own.status, user.id, email);
  }

  // Fallback: service role for bootstrap when RLS blocks (should be rare).
  try {
    const admin = createAdminClient();
    const { data: row } = await admin
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();
    if (row) {
      return resolveProfile(row.role, row.status, user.id, email);
    }
  } catch {
    /* not configured */
  }

  return { ok: false, reason: "forbidden" };
}

function resolveProfile(
  role: unknown,
  status: unknown,
  userId: string,
  email: string
): RequireAdminResult {
  if (status === "suspended") {
    return { ok: false, reason: "forbidden" };
  }
  if (role !== "admin") {
    return { ok: false, reason: "forbidden" };
  }
  // Admin role granted but the invite has not been accepted yet.
  if (status === "invited") {
    return { ok: false, reason: "invited" };
  }
  return { ok: true, userId, email, isSuperAdmin: false };
}
