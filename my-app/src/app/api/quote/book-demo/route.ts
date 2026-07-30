import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isDemoBookingEnabled } from "@/lib/orders/demo-booking";
import {
  createSoftGateBooking,
  SoftGateBookingError,
} from "@/lib/orders/create-soft-gate-booking";
import { sendBookingConfirmationEmail } from "@/lib/emails/send-booking-confirmation";

/**
 * POST /api/quote/book-demo
 * Non-production soft-gate: create a real owned job without Stripe.
 * Production always 403 (vault fail-closed).
 */

const lineSchema = z.object({
  name: z.string().min(1).max(300),
  quantity: z.number().int().min(1).max(99).optional(),
  src: z.string().max(40).optional(),
  category: z.string().max(40).optional(),
  assemblyCents: z.number().int().nonnegative().optional(),
});

const bodySchema = z.object({
  items: z.array(lineSchema).min(1).max(50),
  pickupMode: z.enum(["pickup", "ship"]).nullable().optional(),
  deliveryLine: z.string().max(400).optional(),
});

export async function POST(request: Request) {
  if (!isDemoBookingEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: "demo_booking_disabled",
        message: "Demo booking is not available in production.",
      },
      { status: 403 }
    );
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "auth_not_configured" },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthorized", message: "Sign in to book." },
      { status: 401 }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  try {
    const input = bodySchema.parse(raw);
    const result = await createSoftGateBooking({
      user,
      items: input.items,
      pickupMode: input.pickupMode ?? null,
      deliveryLine: input.deliveryLine,
    });

    // Booking email — never fails the book response
    const firstName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name.split(" ")[0]
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name.split(" ")[0]
          : null;
    const itemSummary =
      input.items.length === 1
        ? `${input.items[0]!.name} · 1 item`
        : `${input.items[0]?.name ?? "Your build"} · ${input.items.length} items`;

    await sendBookingConfirmationEmail({
      to: user.email ?? "",
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      customerName: firstName,
      deliveryLine: input.deliveryLine ?? null,
      itemSummary,
      depositCents: result.depositCents,
      paymentNote:
        "No deposit was charged (demo book path — Stripe not required for this test).",
    });

    return NextResponse.json(
      {
        ok: true,
        demo: true,
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        depositCents: result.depositCents,
        totalCents: result.totalCents,
      },
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
    if (e instanceof SoftGateBookingError) {
      const status = e.code === "empty_quote" ? 400 : 500;
      return NextResponse.json(
        { ok: false, error: e.code, message: e.message },
        { status }
      );
    }
    // Missing service role / env
    if (e instanceof Error && e.message.includes("environment variable")) {
      return NextResponse.json(
        {
          ok: false,
          error: "orders_not_configured",
          message: "Booking storage is not configured.",
        },
        { status: 503 }
      );
    }
    console.error("[api/quote/book-demo]", e);
    return NextResponse.json(
      { ok: false, error: "order_create_failed" },
      { status: 500 }
    );
  }
}
