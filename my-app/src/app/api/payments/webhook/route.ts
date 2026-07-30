import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStripeReady, isStripeWebhookReady } from "@/lib/payments";

/**
 * POST /api/payments/webhook
 * Verify Stripe signatures and reconcile order/payment state.
 *
 * GATED: returns 503 until STRIPE_WEBHOOK_SECRET is set. Handler logic is
 * complete and activates on cutover — no code change.
 *
 * Local testing (once keys exist):
 *   stripe listen --forward-to localhost:3000/api/payments/webhook
 */
export async function POST(request: Request) {
  if (!isStripeReady() || !isStripeWebhookReady()) {
    return NextResponse.json(
      {
        ok: false,
        error: "stripe_webhook_not_configured",
        message:
          "Webhook is not enabled yet. Set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET.",
      },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { ok: false, error: "missing_signature" },
      { status: 400 }
    );
  }

  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      serverEnv.stripeWebhookSecret
    );
  } catch (e) {
    console.error(
      "[api/payments/webhook] signature verify failed",
      e instanceof Error ? e.message : e
    );
    return NextResponse.json(
      { ok: false, error: "invalid_signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          // TODO(C3/C5): also set lifecycle_status: awaiting_arrival and
          // payment_status: deposit_paid so My Jobs shows the paid book without
          // soft-gate. Prefer a shared markOrderBookedAfterDeposit(orderId).
          // Soft-gate demo path already writes awaiting_arrival via book-demo.
          await supabase
            .from("orders")
            .update({
              status: "deposit_paid",
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : null,
              stripe_customer_id:
                typeof session.customer === "string" ? session.customer : null,
            })
            .eq("id", orderId);

          await supabase.from("payments").insert({
            order_id: orderId,
            kind: "deposit",
            amount_cents: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            status: "succeeded",
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
          });
        }
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await supabase
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId)
            .eq("status", "pending_payment");
        }
        break;
      }
      default:
        // Unhandled events are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (e) {
    console.error("[api/payments/webhook] handler error", e);
    return NextResponse.json({ ok: false, error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
