/**
 * Branded staff invite email.
 *
 * Truth: Supabase Auth action link (invite / magiclink).
 * Delivery: Resend via dispatchEmail (or outbox when RESEND not configured).
 * Never throws — invite role write must not fail because of email.
 */
import { publicEnv } from "@/lib/env";
import { dispatchEmail, isEmailReady } from "./dispatch";
import { staffInvite } from "./templates";

/** Keep labels here to avoid import cycle with lib/admin/team. */
const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  technician: "Technician",
  driver: "Driver",
};

export type SendStaffInviteInput = {
  to: string;
  role: "admin" | "technician" | "driver";
  /** Supabase generateLink action_link */
  inviteUrl: string;
  inviterEmail?: string | null;
};

export type SendStaffInviteResult = {
  attempted: boolean;
  sent: boolean;
  /** True when Resend is configured (live path available). */
  resendReady: boolean;
  error: string | null;
};

/**
 * Send (or outbox) the branded staff invite with the Supabase action link.
 */
export async function sendStaffInviteEmail(
  input: SendStaffInviteInput
): Promise<SendStaffInviteResult> {
  const to = input.to?.trim().toLowerCase();
  const inviteUrl = input.inviteUrl?.trim();
  const resendReady = isEmailReady();

  if (!to || !inviteUrl) {
    console.info("[email:staff-invite] skip — missing to or inviteUrl");
    return {
      attempted: false,
      sent: false,
      resendReady,
      error: "missing_fields",
    };
  }

  try {
    const appName = publicEnv.appName || "ScrewIt Pros";
    const email = staffInvite({
      inviteUrl,
      roleLabel: ROLE_LABEL[input.role] ?? input.role,
      inviterEmail: input.inviterEmail ?? null,
      appName,
    });

    const result = await dispatchEmail(to, email, {
      payload: {
        role: input.role,
        inviterEmail: input.inviterEmail ?? null,
      },
    });

    console.info(
      `[email:staff-invite] to=${to} role=${input.role} sent=${result.sent} error=${result.error ?? "none"}`
    );

    return {
      attempted: true,
      sent: result.sent,
      resendReady,
      error: result.error,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "staff_invite_send_failed";
    console.error("[email:staff-invite]", message);
    return {
      attempted: true,
      sent: false,
      resendReady,
      error: message,
    };
  }
}
