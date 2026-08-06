import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { priceDraftServerSide } from "@/lib/quote/server-pricing";

/**
 * POST /api/quote/draft
 * Server-prices a quote draft and inserts a pending_payment order.
 * Checkout then accepts only { orderId } — never client totalCents.
 *
 * Auth required (Decision #2: quote public, book signed-in).
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
  /** Delivery geo for server-side Model 1 travel fee (anti-spoof). */
  deliveryLat: z.number().min(-90).max(90).optional(),
  deliveryLng: z.number().min(-180).max(180).optional(),
  deliveryZip: z.string().max(12).optional(),
});

export async function POST(request: Request) {
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
    // Server re-prices travel from delivery geo — never trust client cents.
    const priced = await priceDraftServerSide({
      items: input.items,
      pickupMode: input.pickupMode ?? null,
      delivery: {
        lat: input.deliveryLat,
        lng: input.deliveryLng,
        zip: input.deliveryZip,
      },
    });

    if (!priced.travelAllowed) {
      return NextResponse.json(
        {
          ok: false,
          error: "zip_refused",
          message:
            priced.travelLabel ||
            "We can’t serve that delivery ZIP. Choose another address.",
        },
        { status: 400 }
      );
    }

    if (priced.subtotalCents <= 0) {
      return NextResponse.json(
        { ok: false, error: "empty_quote", message: "Add items before booking." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .insert({
        customer_id: user.id,
        customer_email: user.email ?? null,
        status: "pending_payment",
        total_cents: priced.subtotalCents,
        deposit_cents: priced.depositCents,
        metadata: {
          source: "quote_draft",
          pickupMode: input.pickupMode ?? null,
          deliveryLine: input.deliveryLine ?? null,
          lineCount: priced.lineCount,
          assemblyCents: priced.assemblyCents,
          travelCents: priced.travelCents,
          beyondRadius: priced.beyondRadius,
          travelMiles: priced.travelMiles,
        },
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[api/quote/draft] insert", error?.message);
      return NextResponse.json(
        { ok: false, error: "order_create_failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        orderId: data.id as string,
        totalCents: priced.subtotalCents,
        depositCents: priced.depositCents,
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
    console.error("[api/quote/draft]", e);
    return NextResponse.json(
      { ok: false, error: "draft_failed" },
      { status: 500 }
    );
  }
}
