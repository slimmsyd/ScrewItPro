import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type RequireAdminResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: "unauthenticated" | "forbidden" | "not_configured" };

/**
 * Authoritative admin gate — reads profiles.role (not JWT claim alone).
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

  // Prefer user-scoped client (RLS). If select own works, check role.
  const { data: own, error: ownErr } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!ownErr && own) {
    if (own.status === "suspended") {
      return { ok: false, reason: "forbidden" };
    }
    if (own.role === "admin") {
      return { ok: true, userId: user.id, email: user.email ?? "" };
    }
    return { ok: false, reason: "forbidden" };
  }

  // Fallback: service role for bootstrap when RLS blocks (should be rare).
  try {
    const admin = createAdminClient();
    const { data: row } = await admin
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();
    if (row?.role === "admin" && row.status !== "suspended") {
      return { ok: true, userId: user.id, email: user.email ?? "" };
    }
  } catch {
    /* not configured */
  }

  return { ok: false, reason: "forbidden" };
}
