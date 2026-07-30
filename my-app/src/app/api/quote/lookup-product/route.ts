import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { lookupProduct, lookupResultToQuoteItem } from "@/lib/quote/product-lookup";

/**
 * POST /api/quote/lookup-product
 * Fetches a customer-pasted product URL server-side, parses schema.org/
 * Open-Graph data, and returns a ready-to-add QuoteItem. The QuoteItem
 * conversion happens here (server-side) rather than in the client, because
 * this module transitively imports cheerio + node:dns — importing it from
 * a "use client" component would try to bundle Node-only APIs into the
 * browser build. No readiness gate: unlike Stripe/Resend/Supabase, this
 * needs no operator-provided secret and is always live. No retailer-
 * hostname allowlist: the real gate is whether parsing succeeds, not which
 * domain was pasted. Body: { url: string }
 */
const bodySchema = z.object({
  url: z.string().url().max(2000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json", message: "Expected JSON body." },
      { status: 400 }
    );
  }

  try {
    const { url } = bodySchema.parse(body);
    const outcome = await lookupProduct(url);

    if (!outcome.ok) {
      const status =
        outcome.reason === "invalid_url" || outcome.reason === "blocked_host"
          ? 400
          : outcome.reason === "parse_failed"
            ? 422
            : 502;
      return NextResponse.json(
        { ok: false, error: outcome.reason, message: outcome.message },
        { status }
      );
    }

    return NextResponse.json(
      { ok: true, item: lookupResultToQuoteItem(outcome.result) },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { ok: false, error: "invalid_input", message: "That doesn't look like a valid link." },
        { status: 400 }
      );
    }
    console.error("[api/quote/lookup-product]", err);
    return NextResponse.json(
      { ok: false, error: "lookup_failed", message: "Something went wrong reading that link. Try again." },
      { status: 500 }
    );
  }
}
