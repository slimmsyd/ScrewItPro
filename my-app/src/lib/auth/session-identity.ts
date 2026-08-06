import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdminEmail } from "@/lib/auth/require-admin";
import {
  parseSipRole,
  parseSipStatus,
  roleFromAuthUser,
  statusFromAuthUser,
  type SipRole,
  type SipStatus,
} from "@/lib/auth/roles";

/**
 * Display / routing identity for the signed-in user.
 *
 * Privilege for /admin/* is still only requireAdmin() — this is never authz.
 * Prefer profiles.role over JWT so the account menu matches real ops roles
 * even when the Custom Access Token hook is not live.
 */
export type SessionIdentity = {
  role: SipRole;
  status: SipStatus;
  /** Env SUPER_ADMIN_EMAILS — display only; gates re-check the allowlist. */
  isSuperAdmin: boolean;
};

/**
 * Resolve role for session UI + post-login home hints.
 * Order: super-admin env → profiles row → JWT metadata → customer.
 */
export async function resolveSessionIdentity(
  user: User
): Promise<SessionIdentity> {
  const email = user.email ?? "";
  const isSuperAdmin = isSuperAdminEmail(email);

  if (isSuperAdmin) {
    // Super admin may have no profiles.role=admin row; still show Admin chrome.
    const fromProfile = await readProfileRoleStatus(user.id);
    return {
      role: "admin",
      status: fromProfile?.status ?? "active",
      isSuperAdmin: true,
    };
  }

  const fromProfile = await readProfileRoleStatus(user.id);
  if (fromProfile) {
    return {
      role: fromProfile.role,
      status: fromProfile.status,
      isSuperAdmin: false,
    };
  }

  return {
    role: roleFromAuthUser(user),
    status: statusFromAuthUser(user),
    isSuperAdmin: false,
  };
}

async function readProfileRoleStatus(
  userId: string
): Promise<{ role: SipRole; status: SipStatus } | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      role: parseSipRole(data.role),
      status: parseSipStatus(data.status),
    };
  } catch {
    return null;
  }
}
