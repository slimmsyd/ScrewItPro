/**
 * Admin team roster + invite helpers.
 *
 * Super admins (SUPER_ADMIN_EMAILS) are env-only — never granted here.
 * Staff: profiles.role ∈ admin | technician | driver.
 */

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env";
import { publicEnv } from "@/lib/env";
import type { SipRole, SipStatus } from "@/lib/auth/roles";
import { parseSipRole, parseSipStatus } from "@/lib/auth/roles";

/** Roles that can be assigned via Invite member (not customer, not super-admin). */
export const STAFF_INVITE_ROLES = [
  "admin",
  "technician",
  "driver",
] as const;

export type StaffInviteRole = (typeof STAFF_INVITE_ROLES)[number];

export function isStaffInviteRole(v: unknown): v is StaffInviteRole {
  return (
    typeof v === "string" &&
    (STAFF_INVITE_ROLES as readonly string[]).includes(v)
  );
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email")
    .transform(normalizeEmail),
  role: z.enum(STAFF_INVITE_ROLES),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

/**
 * Who may grant which staff role.
 * Super admin (env) may invite any staff role.
 * Profile admins may invite technician/driver only — never peer admins.
 */
export function canGrantStaffRole(opts: {
  inviterIsSuperAdmin: boolean;
  role: StaffInviteRole;
}): boolean {
  if (opts.role === "admin") {
    return opts.inviterIsSuperAdmin;
  }
  return true;
}

export type TeamMember = {
  id: string;
  email: string;
  role: SipRole;
  status: SipStatus;
  fullName: string | null;
  updatedAt: string | null;
};

export type TeamRoster = {
  superAdmins: { email: string }[];
  members: TeamMember[];
};

export function listSuperAdminEmails(): { email: string }[] {
  return serverEnv.superAdminEmails.map((email) => ({ email }));
}

type AdminClient = ReturnType<typeof createAdminClient>;

export async function listStaffMembers(
  admin: AdminClient = createAdminClient()
): Promise<TeamMember[]> {
  const { data, error } = await admin
    .from("profiles")
    .select("id, email, role, status, full_name, updated_at")
    .in("role", [...STAFF_INVITE_ROLES])
    .order("email", { ascending: true });

  if (error) {
    throw new Error(`team_list_failed: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    email: normalizeEmail(String(row.email ?? "")),
    role: parseSipRole(row.role),
    status: parseSipStatus(row.status),
    fullName: (row.full_name as string | null) ?? null,
    updatedAt: (row.updated_at as string | null) ?? null,
  }));
}

export async function fetchTeamRoster(
  admin: AdminClient = createAdminClient()
): Promise<TeamRoster> {
  const members = await listStaffMembers(admin);
  return {
    superAdmins: listSuperAdminEmails(),
    members,
  };
}

export type InviteResult =
  | {
      ok: true;
      member: TeamMember;
      createdAuthUser: boolean;
      /** Branded Resend (or outbox) path attempted with a Supabase action link. */
      emailSent: boolean;
      emailError: string | null;
    }
  | {
      ok: false;
      error:
        | "role_not_allowed"
        | "already_staff"
        | "invite_failed"
        | "profile_not_found"
        | "not_configured";
      message?: string;
    };

/**
 * Invite or promote a user to a staff role (status = invited until first login).
 *
 * Truth: Supabase Auth user + profiles role/status.
 * Brand: Resend staff-invite email with Supabase generateLink action_link.
 * Does not use Supabase's built-in invite email (no generic Auth mail).
 */
export async function inviteTeamMember(opts: {
  email: string;
  role: StaffInviteRole;
  inviterIsSuperAdmin: boolean;
  /** Shown in branded email (optional). */
  inviterEmail?: string | null;
  admin?: AdminClient;
}): Promise<InviteResult> {
  if (!canGrantStaffRole({
    inviterIsSuperAdmin: opts.inviterIsSuperAdmin,
    role: opts.role,
  })) {
    return {
      ok: false,
      error: "role_not_allowed",
      message: "Only super admins can invite new admins.",
    };
  }

  const email = normalizeEmail(opts.email);
  let admin: AdminClient;
  try {
    admin = opts.admin ?? createAdminClient();
  } catch {
    return { ok: false, error: "not_configured" };
  }

  // Existing profile?
  const { data: existing, error: findErr } = await admin
    .from("profiles")
    .select("id, email, role, status, full_name, updated_at")
    .eq("email", email)
    .maybeSingle();

  if (findErr) {
    return {
      ok: false,
      error: "invite_failed",
      message: findErr.message,
    };
  }

  if (existing) {
    const currentRole = parseSipRole(existing.role);
    const currentStatus = parseSipStatus(existing.status);
    if (
      isStaffInviteRole(currentRole) &&
      currentRole === opts.role &&
      (currentStatus === "invited" || currentStatus === "active")
    ) {
      return {
        ok: false,
        error: "already_staff",
        message: "That person already has this staff role.",
      };
    }

    const setResult = await setProfileStaff(
      admin,
      existing.id as string,
      opts.role,
      "invited"
    );
    if (!setResult.ok) return setResult;

    const link = await generateStaffAuthLink(admin, email, existing.id as string);
    const mail = await deliverStaffInviteEmail({
      email,
      role: opts.role,
      inviteUrl: link.actionLink,
      inviterEmail: opts.inviterEmail,
    });

    return {
      ok: true,
      member: setResult.member,
      createdAuthUser: false,
      emailSent: mail.emailSent,
      emailError: mail.emailError,
    };
  }

  // No profile — create Auth user via generateLink (no Supabase email send)
  const invite = await ensureAuthUserForInvite(admin, email);
  if (!invite.ok) {
    return { ok: false, error: "invite_failed", message: invite.message };
  }

  const profileId = await ensureProfileForUser(admin, invite.userId, email);
  if (!profileId) {
    return {
      ok: false,
      error: "profile_not_found",
      message: "Account created but profile is missing. Retry in a moment.",
    };
  }

  const setResult = await setProfileStaff(admin, profileId, opts.role, "invited");
  if (!setResult.ok) return setResult;

  // Prefer link from ensure step; re-generate if missing
  let actionLink = invite.actionLink;
  if (!actionLink) {
    const again = await generateStaffAuthLink(admin, email, invite.userId);
    actionLink = again.actionLink;
  }

  const mail = await deliverStaffInviteEmail({
    email,
    role: opts.role,
    inviteUrl: actionLink,
    inviterEmail: opts.inviterEmail,
  });

  return {
    ok: true,
    member: setResult.member,
    createdAuthUser: invite.created,
    emailSent: mail.emailSent,
    emailError: mail.emailError,
  };
}

async function deliverStaffInviteEmail(opts: {
  email: string;
  role: StaffInviteRole;
  inviteUrl: string | null;
  inviterEmail?: string | null;
}): Promise<{ emailSent: boolean; emailError: string | null }> {
  if (!opts.inviteUrl) {
    return {
      emailSent: false,
      emailError: "Could not create sign-in link",
    };
  }

  try {
    const { sendStaffInviteEmail } = await import(
      "@/lib/emails/send-staff-invite"
    );
    const result = await sendStaffInviteEmail({
      to: opts.email,
      role: opts.role,
      inviteUrl: opts.inviteUrl,
      inviterEmail: opts.inviterEmail ?? null,
    });
    return {
      emailSent: result.sent,
      emailError: result.sent
        ? null
        : result.error ??
          (result.resendReady
            ? "Email failed to send"
            : "Email saved to outbox (RESEND not configured)"),
    };
  } catch (e) {
    return {
      emailSent: false,
      emailError: e instanceof Error ? e.message : "email_failed",
    };
  }
}

function staffInviteRedirectTo(): string {
  const base = publicEnv.appUrl.replace(/\/$/, "") || "http://localhost:3000";
  return `${base}/auth/callback?return_to=${encodeURIComponent("/admin/signin")}`;
}

/**
 * Supabase Auth action link only — does not send Supabase's email.
 * Prefer invite for new users; magiclink for existing.
 */
async function generateStaffAuthLink(
  admin: AdminClient,
  email: string,
  knownUserId?: string
): Promise<{ actionLink: string | null; userId: string | null }> {
  const redirectTo = staffInviteRedirectTo();

  const tryTypes = ["invite", "magiclink"] as const;
  for (const type of tryTypes) {
    const { data, error } = await admin.auth.admin.generateLink({
      type,
      email,
      options: { redirectTo },
    });
    const link = data?.properties?.action_link ?? null;
    const userId = data?.user?.id ?? knownUserId ?? null;
    if (!error && link) {
      return { actionLink: link, userId };
    }
  }

  return { actionLink: null, userId: knownUserId ?? null };
}

async function setProfileStaff(
  admin: AdminClient,
  userId: string,
  role: StaffInviteRole,
  status: "invited" | "active" | "suspended"
): Promise<
  | { ok: true; member: TeamMember }
  | {
      ok: false;
      error: "invite_failed" | "profile_not_found";
      message?: string;
    }
> {
  const { data, error } = await admin.rpc("admin_set_profile_staff", {
    p_user_id: userId,
    p_role: role,
    p_status: status,
  });

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("profile_not_found")) {
      return { ok: false, error: "profile_not_found", message: msg };
    }
    return { ok: false, error: "invite_failed", message: msg };
  }

  // RPC may return a single object or array depending on PostgREST
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    // Fallback read
    const { data: prof, error: readErr } = await admin
      .from("profiles")
      .select("id, email, role, status, full_name, updated_at")
      .eq("id", userId)
      .maybeSingle();
    if (readErr || !prof) {
      return {
        ok: false,
        error: "invite_failed",
        message: readErr?.message ?? "Could not read profile after update",
      };
    }
    return {
      ok: true,
      member: {
        id: prof.id as string,
        email: normalizeEmail(String(prof.email ?? "")),
        role: parseSipRole(prof.role),
        status: parseSipStatus(prof.status),
        fullName: (prof.full_name as string | null) ?? null,
        updatedAt: (prof.updated_at as string | null) ?? null,
      },
    };
  }

  const r = row as Record<string, unknown>;
  return {
    ok: true,
    member: {
      id: String(r.id),
      email: normalizeEmail(String(r.email ?? "")),
      role: parseSipRole(r.role),
      status: parseSipStatus(r.status),
      fullName: (r.full_name as string | null) ?? null,
      updatedAt: (r.updated_at as string | null) ?? null,
    },
  };
}

/**
 * Ensure Auth user exists and return a one-time action link (no Supabase email).
 */
async function ensureAuthUserForInvite(
  admin: AdminClient,
  email: string
): Promise<
  | { ok: true; userId: string; created: boolean; actionLink: string | null }
  | { ok: false; message: string }
> {
  const redirectTo = staffInviteRedirectTo();

  // generateLink type=invite creates the user when missing and returns action_link
  // without sending Supabase's built-in email (unlike inviteUserByEmail).
  const { data: invited, error: inviteErr } = await admin.auth.admin.generateLink(
    {
      type: "invite",
      email,
      options: { redirectTo },
    }
  );

  if (!inviteErr && invited?.user?.id) {
    return {
      ok: true,
      userId: invited.user.id,
      created: true,
      actionLink: invited.properties?.action_link ?? null,
    };
  }

  const msg = (inviteErr?.message ?? "").toLowerCase();
  const already =
    msg.includes("already") ||
    msg.includes("registered") ||
    msg.includes("exists") ||
    msg.includes("duplicate");

  if (already) {
    const found = await findAuthUserIdByEmail(admin, email);
    if (found) {
      const link = await generateStaffAuthLink(admin, email, found);
      return {
        ok: true,
        userId: found,
        created: false,
        actionLink: link.actionLink,
      };
    }
  }

  // Fallback: create confirmed user, then magic link
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });

  if (!createErr && created?.user?.id) {
    const link = await generateStaffAuthLink(admin, email, created.user.id);
    return {
      ok: true,
      userId: created.user.id,
      created: true,
      actionLink: link.actionLink,
    };
  }

  const found = await findAuthUserIdByEmail(admin, email);
  if (found) {
    const link = await generateStaffAuthLink(admin, email, found);
    return {
      ok: true,
      userId: found,
      created: false,
      actionLink: link.actionLink,
    };
  }

  return {
    ok: false,
    message:
      inviteErr?.message ??
      createErr?.message ??
      "Could not create or invite auth user",
  };
}

async function findAuthUserIdByEmail(
  admin: AdminClient,
  email: string
): Promise<string | null> {
  const target = normalizeEmail(email);
  // Prefer profiles (always in sync after handle_new_user)
  const { data: prof } = await admin
    .from("profiles")
    .select("id")
    .eq("email", target)
    .maybeSingle();
  if (prof?.id) return prof.id as string;

  // Fallback: list users (paginated; fine for small orgs)
  let page = 1;
  const perPage = 200;
  for (let i = 0; i < 10; i++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error || !data?.users?.length) break;
    const hit = data.users.find(
      (u) => u.email && normalizeEmail(u.email) === target
    );
    if (hit?.id) return hit.id;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function ensureProfileForUser(
  admin: AdminClient,
  userId: string,
  email: string
): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (data?.id) return data.id as string;

    // Trigger may not have fired — insert minimal profile (service role)
    const { error } = await admin.from("profiles").upsert(
      {
        id: userId,
        email: normalizeEmail(email),
        role: "customer",
        status: "active",
      },
      { onConflict: "id" }
    );
    if (!error) {
      const { data: again } = await admin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      if (again?.id) return again.id as string;
    }

    await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
  }
  return null;
}

/**
 * Flip invited staff → active. Call with user-scoped client after login.
 */
export async function activateOwnStaffInvite(supabase: {
  rpc: (
    fn: string,
    args?: Record<string, unknown>
  ) => PromiseLike<{ error: { message: string } | null }>;
}): Promise<void> {
  try {
    const { error } = await supabase.rpc("activate_own_staff_invite");
    if (error) {
      // Missing migration or non-staff user — ignore
      console.warn("[activateOwnStaffInvite]", error.message);
    }
  } catch {
    /* non-fatal */
  }
}

/** True when role is inviteable staff. */
export function isStaffProfileRole(role: SipRole): boolean {
  return isStaffInviteRole(role);
}
