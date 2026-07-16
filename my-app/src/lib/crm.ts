import { getEnvStatus, serverEnv } from "@/lib/env";

/**
 * Unified people/CRM mirror → n8n → Google Sheet ("ScrewIt Pros — Users CRM").
 *
 * One row per person, deduped by email (the n8n workflow upserts on the email
 * column). Both waitlist signups and quote inquiries flow through here — a
 * waitlist entry and a "user" are the same person until they convert, so they
 * share one sheet distinguished by the `on_waitlist` boolean.
 *
 * Gated + fire-and-forget: no-op with a log when N8N_CRM_WEBHOOK_URL is unset,
 * and never throws (a webhook failure must not break the primary capture).
 */

export type CrmUserPayload = {
  email: string;
  name?: string | null;
  /** TRUE = still on the waitlist, FALSE = converted to an active customer. */
  onWaitlist: boolean;
  provider?: string | null;
  source?: string | null;
  /** ISO timestamp of first capture. */
  createdAt?: string | null;
  /** ISO timestamp when on_waitlist flipped to FALSE (blank until converted). */
  convertedAt?: string | null;
  /** Linked app account id once converted (blank until then). */
  userId?: string | null;
};

export function isN8nCrmConfigured(): boolean {
  return getEnvStatus().n8n.crmWebhookConfigured;
}

export async function forwardUserToN8n(
  payload: CrmUserPayload
): Promise<{ forwarded: boolean }> {
  if (!isN8nCrmConfigured()) {
    console.info(
      `[crm:n8n] (skipped — N8N_CRM_WEBHOOK_URL unset) email=${payload.email}`
    );
    return { forwarded: false };
  }

  try {
    // Google Sheets (USER_ENTERED) reads TRUE/FALSE as booleans.
    const res = await fetch(serverEnv.n8nCrmWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email,
        name: payload.name ?? "",
        on_waitlist: payload.onWaitlist ? "TRUE" : "FALSE",
        provider: payload.provider ?? "",
        source: payload.source ?? "",
        created_at: payload.createdAt ?? "",
        converted_at: payload.convertedAt ?? "",
        user_id: payload.userId ?? "",
      }),
    });
    if (!res.ok) {
      console.error(
        `[crm:n8n] webhook returned ${res.status} for email=${payload.email}`
      );
      return { forwarded: false };
    }
    return { forwarded: true };
  } catch (e) {
    console.error(
      `[crm:n8n] webhook failed for email=${payload.email}`,
      e instanceof Error ? e.message : e
    );
    return { forwarded: false };
  }
}
