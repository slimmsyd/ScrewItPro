/**
 * Gated email dispatch — the plug-and-play seam for transactional email.
 *
 * Mirrors the waitlist readiness pattern (isWaitlistBackendReady):
 *   - isEmailReady() reads env; missing RESEND_API_KEY ⇒ not ready.
 *   - dispatchEmail() ALWAYS builds the email. When ready it sends via Resend;
 *     when not ready it records the email to an in-memory outbox and logs it,
 *     so a real signup/inquiry still exercises the full path with no crash.
 *
 * Cutover to live email = set RESEND_API_KEY + RESEND_FROM_EMAIL and redeploy.
 * No code change required.
 */

import { getEnvStatus } from "@/lib/env";
import { sendEmail, type SendEmailOptions } from "@/lib/resend";
import { recordEmailLog } from "./log";
import type { RenderedEmail } from "./templates";

/** True when Resend credentials are present and live sending should occur. */
export function isEmailReady(): boolean {
  return getEnvStatus().resend.configured;
}

export type OutboxEntry = {
  id: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  sentLive: boolean;
  at: string;
};

// Dev-only in-memory ring buffer of recent emails (last N). Lets /dev/emails
// show what WOULD have been sent while credentials are gated. Not persisted —
// this is a development aid, not a mail store.
const OUTBOX_LIMIT = 50;
const outbox: OutboxEntry[] = [];

let seq = 0;
function nextId(): string {
  seq += 1;
  return `mail_${seq}`;
}

export function getOutbox(): readonly OutboxEntry[] {
  return outbox;
}

export type DispatchResult = {
  /** true ONLY if Resend confirmed the send and returned an id. */
  sent: boolean;
  outboxId: string;
  /** Resend's message id on success; null otherwise. Traceable in their dashboard. */
  resendId: string | null;
  /** Why the send failed. Null on success and when gated. */
  error: string | null;
};

/**
 * Send (or capture) a rendered email, and record the attempt to email_log.
 * `to` and optional `replyTo` are the only per-recipient params; subject/html/text
 * come from a template's RenderedEmail.
 *
 * Never throws — a failed email must not break the caller's primary flow
 * (signup, lead capture). Inspect the returned `sent` / `error` instead.
 */
export async function dispatchEmail(
  to: string | string[],
  email: RenderedEmail,
  extra?: {
    replyTo?: string;
    orderId?: string | null;
    inquiryId?: string | null;
    payload?: Record<string, unknown>;
  }
): Promise<DispatchResult> {
  const entry: OutboxEntry = {
    id: nextId(),
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
    sentLive: false,
    at: new Date().toISOString(),
  };

  // Entry trace: proves dispatchEmail was reached at all, and shows which gate
  // decides what happens next.
  console.info(
    `[email:dispatch] called code=${email.code} to=${String(to)} resendReady=${isEmailReady()}`
  );

  const log = (
    status: "sent" | "failed" | "skipped",
    resendId: string | null,
    errorMessage: string | null
  ) =>
    recordEmailLog({
      templateCode: email.code,
      to,
      subject: email.subject,
      status,
      resendId,
      errorMessage,
      orderId: extra?.orderId ?? null,
      inquiryId: extra?.inquiryId ?? null,
      payload: extra?.payload,
    });

  if (!isEmailReady()) {
    pushOutbox(entry);
    console.info(
      `[email:outbox] (not sent — RESEND_API_KEY missing) to=${String(
        to
      )} subject="${email.subject}"`
    );
    await log("skipped", null, null);
    return { sent: false, outboxId: entry.id, resendId: null, error: null };
  }

  try {
    const options: SendEmailOptions = {
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: extra?.replyTo,
    };

    // Resend reports API-level rejections (unverified domain, invalid `from`,
    // rate limit) in the response envelope, NOT by throwing. Awaiting without
    // checking `error` reports those failures as successes.
    const { data, error } = await sendEmail(options);

    if (error) {
      const message = `${error.name}: ${error.message}${
        error.statusCode ? ` (${error.statusCode})` : ""
      }`;
      console.error(
        `[email:dispatch] rejected to=${String(to)} subject="${email.subject}" — ${message}`
      );
      pushOutbox(entry);
      await log("failed", null, message);
      return { sent: false, outboxId: entry.id, resendId: null, error: message };
    }

    // Defensive: a success envelope with no id shouldn't happen, but 'sent'
    // without a resend_id violates the email_log check constraint, and the
    // idempotency guard would then suppress a reminder we can't prove went out.
    if (!data?.id) {
      const message = "Resend returned no message id";
      console.error(
        `[email:dispatch] ${message} to=${String(to)} subject="${email.subject}"`
      );
      pushOutbox(entry);
      await log("failed", null, message);
      return { sent: false, outboxId: entry.id, resendId: null, error: message };
    }

    entry.sentLive = true;
    pushOutbox(entry);
    // Positive signal. Without this a successful send is indistinguishable from
    // a send that never happened — both print nothing.
    console.info(
      `[email:dispatch] SENT code=${email.code} to=${String(to)} resendId=${data.id}`
    );
    await log("sent", data.id, null);
    return { sent: true, outboxId: entry.id, resendId: data.id, error: null };
  } catch (e) {
    // Thrown errors are transport-level (network, DNS, aborted request).
    const message = e instanceof Error ? e.message : String(e);
    console.error(
      `[email:dispatch] send failed to=${String(to)} subject="${email.subject}"`,
      message
    );
    pushOutbox(entry);
    await log("failed", null, message);
    return { sent: false, outboxId: entry.id, resendId: null, error: message };
  }
}

function pushOutbox(entry: OutboxEntry) {
  outbox.unshift(entry);
  if (outbox.length > OUTBOX_LIMIT) outbox.length = OUTBOX_LIMIT;
}
