import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  createInquiry,
  inquirySchema,
  isInquiryBackendReady,
  InquiryConfigError,
  InquiryDbError,
} from "@/lib/inquiries";
import { forwardUserToN8n } from "@/lib/crm";
import { serverEnv } from "@/lib/env";
import { dispatchEmail } from "@/lib/emails/dispatch";
import { inquiryAck, newLeadNotice } from "@/lib/emails/templates";

/**
 * POST /api/inquiries
 * Capture an inbound lead. Dual-writes to Supabase `inquiries` AND mirrors to
 * n8n → Excel. Also sends (or captures, while gated) a customer ack + an
 * internal new-lead notice. Body: { email, name?, phone?, service?, message?,
 * pickupAddress?, deliveryAddress?, source? }
 */
export async function POST(request: Request) {
  if (!isInquiryBackendReady()) {
    return NextResponse.json(
      {
        ok: false,
        error: "inquiries_not_configured",
        message:
          "Lead storage is not configured. Add Supabase URL, anon key, and service role key.",
      },
      { status: 503 }
    );
  }

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
    const raw = body as Record<string, unknown>;
    const input = inquirySchema.parse({
      ...raw,
      source: raw.source ?? "quote_dialog",
    });

    const inquiry = await createInquiry(input);

    // Mirror the person into the Users CRM sheet (gated no-op if unset).
    // An inquirer is a prospective user → on_waitlist stays true until converted.
    await forwardUserToN8n({
      email: inquiry.email,
      name: input.name,
      onWaitlist: true,
      provider: "email",
      source: inquiry.source,
      createdAt: inquiry.createdAt,
    });

    // Customer acknowledgement + internal new-lead notice.
    await dispatchEmail(
      inquiry.email,
      inquiryAck({ name: input.name, service: input.service }),
      { inquiryId: inquiry.id }
    );
    // Same accessor the waitlist path uses, so both lead sources notify the same
    // list. Still honours INQUIRY_NOTIFY_EMAIL as a fallback.
    const internalTo = serverEnv.teamNotifyEmails;
    if (internalTo.length > 0) {
      await dispatchEmail(
        internalTo,
        newLeadNotice({
          name: input.name,
          email: inquiry.email,
          service: input.service,
          message: input.message,
          source: inquiry.source,
        }),
        { replyTo: inquiry.email, inquiryId: inquiry.id }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        inquiry: {
          id: inquiry.id,
          email: inquiry.email,
          source: inquiry.source,
        },
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
    if (e instanceof InquiryConfigError) {
      return NextResponse.json(
        { ok: false, error: e.code, message: e.message },
        { status: 503 }
      );
    }
    if (e instanceof InquiryDbError) {
      console.error("[api/inquiries] db", e.message, e.dbCode);
      const missingTable =
        e.dbCode === "42P01" ||
        e.message.toLowerCase().includes("inquiries");
      return NextResponse.json(
        {
          ok: false,
          error: missingTable ? "inquiries_table_missing" : e.code,
          message: missingTable
            ? "Inquiries table is missing. Apply supabase/migrations/20260715120000_inquiries.sql."
            : "Could not save your request. Try again.",
        },
        { status: 500 }
      );
    }
    console.error("[api/inquiries]", e);
    return NextResponse.json(
      {
        ok: false,
        error: "inquiry_failed",
        message: "Could not save your request. Try again.",
      },
      { status: 500 }
    );
  }
}

/** GET /api/inquiries - readiness only (no lead data). */
export async function GET() {
  return NextResponse.json({ ok: true, ready: isInquiryBackendReady() });
}
