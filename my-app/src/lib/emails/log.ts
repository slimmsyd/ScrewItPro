/**
 * Durable record of every transactional email attempt → public.email_log.
 *
 * Replaces the in-memory outbox as the source of truth for "did that email go
 * out?". The outbox (dispatch.ts) is a 50-entry ring buffer that dies on every
 * deploy and never spans serverless instances; this table survives both.
 *
 * Gated + fire-and-forget, mirroring forwardUserToN8n (src/lib/crm.ts):
 * no-op with a log line when Supabase isn't configured, and NEVER throws.
 * The layering rule is the same one that makes the waitlist fan-out safe —
 *   a CRM failure must not break a signup,
 *   a send failure must not break a signup,
 *   a logging failure must not break a send.
 * Recording that something happened is strictly less important than the thing.
 *
 * Written from inside dispatchEmail rather than at call sites, so coverage is
 * structural: no future template can forget to log itself.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { getEnvStatus } from "@/lib/env";
import type { EmailTemplateCode } from "./templates";

/**
 * sent    — Resend confirmed the send and returned an id.
 * failed  — we attempted and it was rejected or threw (see errorMessage).
 * skipped — we never attempted; RESEND_API_KEY absent, captured to the outbox.
 *
 * 'skipped' is deliberately distinct from 'failed': "you haven't configured
 * Resend" and "Resend rejected your domain" are different bugs with different
 * fixes, and collapsing them hides which one you have.
 */
export type EmailLogStatus = "sent" | "failed" | "skipped";

export type EmailLogEntry = {
  templateCode: EmailTemplateCode;
  to: string | string[];
  subject: string;
  status: EmailLogStatus;
  resendId?: string | null;
  errorMessage?: string | null;
  orderId?: string | null;
  inquiryId?: string | null;
  payload?: Record<string, unknown>;
};

function isEmailLogReady(): boolean {
  const status = getEnvStatus();
  return status.supabase.configured && status.supabase.serviceRoleConfigured;
}

/**
 * Persist one email attempt. Resolves regardless of outcome — callers must not
 * need a try/catch around this.
 */
export async function recordEmailLog(entry: EmailLogEntry): Promise<void> {
  if (!isEmailLogReady()) {
    console.info(
      `[email:log] (skipped — Supabase service role not configured) code=${entry.templateCode} status=${entry.status}`
    );
    return;
  }

  // Multi-recipient sends (e.g. a team notify list) are one Resend call and so
  // one row; store the list joined rather than fanning out rows we can't
  // individually confirm.
  const toEmail = Array.isArray(entry.to) ? entry.to.join(", ") : entry.to;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("email_log").insert({
      template_code: entry.templateCode,
      to_email: toEmail,
      subject: entry.subject,
      status: entry.status,
      resend_id: entry.resendId ?? null,
      error_message: entry.errorMessage ?? null,
      order_id: entry.orderId ?? null,
      inquiry_id: entry.inquiryId ?? null,
      payload: entry.payload ?? {},
    });

    if (error) {
      // Surfaces a missing migration as an actionable line rather than silence.
      // PGRST205 ("could not find the table in the schema cache") means the
      // migration landed but PostgREST hasn't reloaded yet — not a code fault.
      console.error(
        `[email:log] insert FAILED code=${entry.templateCode} to=${toEmail} — ${error.code ?? ""} ${error.message}`
      );
    } else {
      console.info(
        `[email:log] recorded code=${entry.templateCode} status=${entry.status} to=${toEmail}`
      );
    }
  } catch (e) {
    console.error(
      `[email:log] insert threw code=${entry.templateCode} to=${toEmail}`,
      e instanceof Error ? e.message : e
    );
  }
}
