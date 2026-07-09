import { Resend } from "resend";
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
 */
export async function sendEmail(options: SendEmailOptions) {
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
