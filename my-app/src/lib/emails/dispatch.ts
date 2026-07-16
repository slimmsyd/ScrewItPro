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
  /** true if actually sent via Resend, false if captured to the outbox. */
  sent: boolean;
  outboxId: string;
};

/**
 * Send (or capture) a rendered email.
 * `to` and optional `replyTo` are the only per-recipient params; subject/html/text
 * come from a template's RenderedEmail.
 */
export async function dispatchEmail(
  to: string | string[],
  email: RenderedEmail,
  extra?: { replyTo?: string }
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

  if (!isEmailReady()) {
    entry.sentLive = false;
    pushOutbox(entry);
    console.info(
      `[email:outbox] (not sent — RESEND_API_KEY missing) to=${String(
        to
      )} subject="${email.subject}"`
    );
    return { sent: false, outboxId: entry.id };
  }

  try {
    const options: SendEmailOptions = {
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: extra?.replyTo,
    };
    await sendEmail(options);
    entry.sentLive = true;
    pushOutbox(entry);
    return { sent: true, outboxId: entry.id };
  } catch (e) {
    // Never let a failed email break the caller's primary flow (signup, lead capture).
    console.error(
      `[email:dispatch] send failed to=${String(to)} subject="${email.subject}"`,
      e instanceof Error ? e.message : e
    );
    entry.sentLive = false;
    pushOutbox(entry);
    return { sent: false, outboxId: entry.id };
  }
}

function pushOutbox(entry: OutboxEntry) {
  outbox.unshift(entry);
  if (outbox.length > OUTBOX_LIMIT) outbox.length = OUTBOX_LIMIT;
}
