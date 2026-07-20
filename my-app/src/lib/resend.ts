import { Resend, type CreateEmailResponse } from "resend";
import { serverEnv } from "@/lib/env";

let resend: Resend | null = null;

/**
 * Resend client for transactional email.
 * Server-only.
 */
export function getResend(): Resend {
  if (!resend) {
    resend = new Resend(serverEnv.resendApiKey);
  }
  return resend;
}

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/**
 * Send a transactional email using RESEND_FROM_EMAIL as the default sender.
 *
 * NOTE: Resend does NOT throw on API-level rejections (unverified domain,
 * invalid `from`, rate limit). Those resolve normally with `error` populated
 * and `data` null. Callers MUST inspect the envelope — awaiting this without
 * checking `error` reports failures as successes.
 */
export async function sendEmail(
  options: SendEmailOptions
): Promise<CreateEmailResponse> {
  const client = getResend();
  return client.emails.send({
    from: serverEnv.resendFromEmail,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });
}
