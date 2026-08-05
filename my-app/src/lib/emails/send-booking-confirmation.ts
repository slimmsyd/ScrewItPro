/**
 * Idempotent booking confirmation send (+ care@ team notice).
 * Never throws — booking API must not fail because of email.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { getEnvStatus, publicEnv, serverEnv } from "@/lib/env";
import { dispatchEmail } from "./dispatch";
import { renderBookingConfirmation } from "./render-booking-confirmation";
import { formatCents } from "@/lib/orders/format";
import {
  newBookingNotice,
  type BookingConfirmationData,
  type EmailTemplateCode,
} from "./templates";

const CUSTOMER_CODE = "booking-confirmation" as const satisfies EmailTemplateCode;
const TEAM_CODE = "booking-team-notice" as const satisfies EmailTemplateCode;

export type SendBookingConfirmationInput = {
  to: string;
  orderId: string;
  orderNumber: string;
  customerName?: string | null;
  deliveryLine?: string | null;
  itemSummary?: string | null;
  depositCents?: number | null;
  paymentNote?: string | null;
  /** How the book was created (e.g. book-demo, stripe-deposit). */
  source?: string | null;
};

async function hasSuccessfulSend(
  orderId: string,
  templateCode: EmailTemplateCode
): Promise<boolean> {
  const status = getEnvStatus();
  if (!status.supabase.configured || !status.supabase.serviceRoleConfigured) {
    return false;
  }
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("email_log")
      .select("id")
      .eq("template_code", templateCode)
      .eq("order_id", orderId)
      .eq("status", "sent")
      .limit(1)
      .maybeSingle();
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

/**
 * Send (or outbox) customer booking-confirmation + care team notice.
 * Safe to call after soft-gate book; later after Stripe deposit.
 */
export async function sendBookingConfirmationEmail(
  input: SendBookingConfirmationInput
): Promise<{ attempted: boolean; skippedReason?: string }> {
  try {
    const to = input.to?.trim();
    if (!to) {
      console.info("[email:booking] skip — no recipient");
      return { attempted: false, skippedReason: "no_recipient" };
    }

    const appUrl = (publicEnv.appUrl || "https://www.screwitpro.com").replace(
      /\/$/,
      ""
    );
    const orderNumber = input.orderNumber;
    const trackUrl = `${appUrl}/customer/orders/${encodeURIComponent(orderNumber)}/track`;
    const depositFormatted =
      input.depositCents != null && input.depositCents >= 0
        ? formatCents(input.depositCents)
        : null;
    const source = input.source?.trim() || "booking";

    let customerAttempted = false;

    if (await hasSuccessfulSend(input.orderId, CUSTOMER_CODE)) {
      console.info(
        `[email:booking] skip customer — already sent for order ${input.orderId}`
      );
    } else {
      const data: BookingConfirmationData = {
        customerName: input.customerName,
        orderNumber,
        trackUrl,
        jobsUrl: `${appUrl}/customer/jobs`,
        deliveryLine: input.deliveryLine,
        itemSummary: input.itemSummary,
        depositFormatted,
        paymentNote: input.paymentNote,
      };

      const rendered = await renderBookingConfirmation(data);
      await dispatchEmail(to, rendered, {
        orderId: input.orderId,
        payload: {
          orderNumber,
          source: "sendBookingConfirmationEmail",
        },
      });
      customerAttempted = true;
    }

    // care@ / TEAM_NOTIFY_EMAILS — same list as waitlist + inquiries
    await sendBookingTeamNotice({
      orderId: input.orderId,
      orderNumber,
      customerEmail: to,
      customerName: input.customerName,
      itemSummary: input.itemSummary,
      deliveryLine: input.deliveryLine,
      depositFormatted,
      paymentNote: input.paymentNote,
      trackUrl,
      source,
    });

    return {
      attempted: customerAttempted,
      skippedReason: customerAttempted ? undefined : "already_sent",
    };
  } catch (e) {
    console.error(
      "[email:booking] failed (non-fatal)",
      e instanceof Error ? e.message : e
    );
    return { attempted: false, skippedReason: "error" };
  }
}

/**
 * Internal ops ping for a new booking. Idempotent per order via email_log.
 * Safe to call alone if customer mail already went out.
 */
export async function sendBookingTeamNotice(input: {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName?: string | null;
  itemSummary?: string | null;
  deliveryLine?: string | null;
  depositFormatted?: string | null;
  paymentNote?: string | null;
  trackUrl?: string | null;
  source?: string | null;
}): Promise<{ attempted: boolean; skippedReason?: string }> {
  try {
    const teamTo = serverEnv.teamNotifyEmails;
    if (teamTo.length === 0) {
      console.info(
        "[email:booking-team] skip — TEAM_NOTIFY_EMAILS unset order=" +
          input.orderNumber
      );
      return { attempted: false, skippedReason: "no_team_recipients" };
    }

    if (await hasSuccessfulSend(input.orderId, TEAM_CODE)) {
      console.info(
        `[email:booking-team] skip — already sent for order ${input.orderId}`
      );
      return { attempted: false, skippedReason: "already_sent" };
    }

    const customerEmail = input.customerEmail.trim();
    if (!customerEmail) {
      console.info("[email:booking-team] skip — no customer email for reply-to");
      return { attempted: false, skippedReason: "no_recipient" };
    }

    await dispatchEmail(
      teamTo,
      newBookingNotice({
        customerName: input.customerName,
        customerEmail,
        orderNumber: input.orderNumber,
        itemSummary: input.itemSummary,
        deliveryLine: input.deliveryLine,
        depositFormatted: input.depositFormatted,
        paymentNote: input.paymentNote,
        trackUrl: input.trackUrl,
        source: input.source,
      }),
      {
        replyTo: customerEmail,
        orderId: input.orderId,
        payload: {
          orderNumber: input.orderNumber,
          source: input.source ?? "booking",
        },
      }
    );

    return { attempted: true };
  } catch (e) {
    console.error(
      "[email:booking-team] failed (non-fatal)",
      e instanceof Error ? e.message : e
    );
    return { attempted: false, skippedReason: "error" };
  }
}
