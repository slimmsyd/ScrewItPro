import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  appUrl,
  computeDepositCents,
  isStripeReady,
} from "@/lib/payments";

/**
 * POST /api/payments/checkout
 * Create a Stripe Checkout Session for the 30% deposit on an order.
 * The card is saved off-session (setup_future_usage) so the balance can be
 * charged automatically at delivery (per ARCHITECTURE-PLAN M2/M4).
 *
 * GATED: returns 503 until Stripe credentials are configured. The logic below
 * is complete and goes live the moment keys are set — no code change.
 *
 * Body: { totalCents, email?, description?, orderId? }
 */
const bodySchema = z.object({
  totalCents: z.number().int().positive().max(100_000_00),
  email: z.string().email().optional(),
  description: z.string().max(300).optional(),
  orderId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
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
    const depositCents = computeDepositCents(input.totalCents);
    const stripe = getStripe();
    const supabase = createAdminClient();

    // Create (or reuse) the interim order row.
    let orderId = input.orderId ?? null;
    if (!orderId) {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          customer_email: input.email ?? null,
          status: "pending_payment",
          total_cents: input.totalCents,
          deposit_cents: depositCents,
        })
        .select("id")
        .single();
      if (error || !data) {
        console.error("[api/payments/checkout] order insert", error?.message);
        return NextResponse.json(
          { ok: false, error: "order_create_failed", message: "Could not start checkout." },
          { status: 500 }
        );
      }
      orderId = data.id;
    }

    const base = appUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: input.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: depositCents,
            product_data: {
              name: input.description ?? "ScrewIt Pros — 30% deposit",
            },
          },
        },
      ],
      // Save the card off-session so the balance can be charged at delivery.
      payment_intent_data: {
        setup_future_usage: "off_session",
        metadata: { order_id: orderId },
      },
      metadata: { order_id: orderId },
      success_url: `${base}/checkout/success?order=${orderId}`,
      cancel_url: `${base}/checkout/cancelled?order=${orderId}`,
    });

    await supabase
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", orderId);

    return NextResponse.json(
      { ok: true, orderId, sessionId: session.id, url: session.url },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_input",
          message: e.issues[0]?.message ?? "Invalid input.",
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
