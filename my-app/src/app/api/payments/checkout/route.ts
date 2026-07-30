import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  appUrl,
  computeDepositCents,
  isStripeReady,
} from "@/lib/payments";

/**
 * POST /api/payments/checkout
 * Create a Stripe Checkout Session for the deposit on a pending order.
 *
 * Body: { orderId } only — totals come from the order row (server-priced draft).
 * Auth required; ownership enforced.
 *
 * Auth is checked *before* Stripe readiness so 401 is testable without keys.
 */
const bodySchema = z.object({
  orderId: z.string().uuid(),
});

export async function POST(request: Request) {
  let userClient;
  try {
    userClient = await createClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "auth_not_configured" },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await userClient.auth.getUser();

  if (!user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthorized", message: "Sign in to book." },
      { status: 401 }
    );
  }

  if (!isStripeReady()) {
    return NextResponse.json(
      {
        ok: false,
        error: "stripe_not_configured",
        message:
          "Payments are not enabled yet. Set STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
      },
      { status: 503 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", message: "Expected JSON body." },
      { status: 400 }
    );
  }

  try {
    const input = bodySchema.parse(raw);
    const admin = createAdminClient();

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("id, customer_id, customer_email, status, total_cents, deposit_cents")
      .eq("id", input.orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json(
        { ok: false, error: "order_not_found" },
        { status: 404 }
      );
    }

    if (order.customer_id && order.customer_id !== user.id) {
      return NextResponse.json(
        { ok: false, error: "forbidden" },
        { status: 403 }
      );
    }

    // Guest-era rows may lack customer_id — claim only if email matches or null owner
    if (!order.customer_id) {
      await admin
        .from("orders")
        .update({
          customer_id: user.id,
          customer_email: user.email ?? order.customer_email,
        })
        .eq("id", order.id)
        .is("customer_id", null);
    }

    if (order.status !== "pending_payment") {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_order_status",
          message: "This order is not awaiting payment.",
        },
        { status: 409 }
      );
    }

    const totalCents = Number(order.total_cents) || 0;
    if (totalCents <= 0) {
      return NextResponse.json(
        { ok: false, error: "invalid_order_total" },
        { status: 400 }
      );
    }

    const depositCents =
      Number(order.deposit_cents) > 0
        ? Number(order.deposit_cents)
        : computeDepositCents(totalCents);

    const stripe = getStripe();
    const base = appUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email ?? order.customer_email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: depositCents,
            product_data: {
              name: "ScrewIt Pros — deposit",
            },
          },
        },
      ],
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata: { order_id: order.id },
      },
      metadata: { order_id: order.id },
      success_url: `${base}/checkout/success?order=${order.id}`,
      cancel_url: `${base}/checkout/cancelled?order=${order.id}`,
    });

    await admin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json(
      { ok: true, orderId: order.id, sessionId: session.id, url: session.url },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_input",
          message: e.issues[0]?.message ?? "Invalid input. Provide orderId only.",
        },
        { status: 400 }
      );
    }
    console.error("[api/payments/checkout]", e);
    return NextResponse.json(
      { ok: false, error: "checkout_failed", message: "Could not start checkout." },
      { status: 500 }
    );
  }
}

/** GET /api/payments/checkout - readiness only. */
export async function GET() {
  return NextResponse.json({ ok: true, ready: isStripeReady() });
}
