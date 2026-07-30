/**
 * Role helpers for session claims + server re-assertion.
 * JWT claim `app_metadata.sip_role` is set by a Supabase Custom Access Token
 * Hook (dashboard config — not a migration). Until the hook is live, default
 * is customer; sensitive gates (admin leads) always re-read profiles.role.
 */

export type SipRole = "customer" | "admin" | "technician" | "driver";
export type SipStatus = "active" | "suspended" | "invited";

const ROLES: readonly SipRole[] = [
  "customer",
  "admin",
  "technician",
  "driver",
] as const;

export function isSipRole(v: unknown): v is SipRole {
  return typeof v === "string" && (ROLES as readonly string[]).includes(v);
}

export function parseSipRole(v: unknown): SipRole {
  return isSipRole(v) ? v : "customer";
}

export function parseSipStatus(v: unknown): SipStatus {
  if (v === "suspended" || v === "invited" || v === "active") return v;
  return "active";
}

/** Read role from JWT app_metadata (hook) or user_metadata fallback. */
export function roleFromAuthUser(user: {
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
} | null | undefined): SipRole {
  if (!user) return "customer";
  const app = user.app_metadata ?? {};
  const meta = user.user_metadata ?? {};
  return parseSipRole(app.sip_role ?? meta.role ?? meta.sip_role);
}

export function statusFromAuthUser(user: {
  app_metadata?: Record<string, unknown>;
} | null | undefined): SipStatus {
  if (!user) return "active";
  return parseSipStatus(user.app_metadata?.sip_status);
}
