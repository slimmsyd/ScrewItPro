import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  isWaitlistBackendReady,
  upsertWaitlistEntry,
  WaitlistConfigError,
  WaitlistDbError,
  waitlistSignupSchema,
} from "@/lib/waitlist";

/**
 * POST /api/waitlist
 * Persist an email (or OAuth-backed) waitlist signup.
 * Body: { email, name?, picture?, provider?, source?, convertedUserId? }
 */
export async function POST(request: Request) {
  if (!isWaitlistBackendReady()) {
    return NextResponse.json(
      {
        ok: false,
        error: "waitlist_not_configured",
        message:
          "Waitlist storage is not configured. Add Supabase URL, anon key, and service role key.",
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
    const input = waitlistSignupSchema.parse({
      ...raw,
      provider: raw.provider ?? "email",
      source: raw.source ?? "join",
      convertedUserId: raw.convertedUserId ?? raw.converted_user_id ?? null,
    });

    // First-join side effects (confirmation email, team notice, CRM sheet mirror)
    // all run inside upsertWaitlistEntry, so this route, email signup, and the
    // Google OAuth callback behave identically.
    const result = await upsertWaitlistEntry(input);

    return NextResponse.json(
      {
        ok: true,
        entry: {
          id: result.id,
          email: result.email,
          position: result.position,
          created: result.created,
          provider: result.provider,
        },
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_email",
          message: e.issues[0]?.message ?? "Invalid input.",
        },
        { status: 400 }
      );
    }
    if (e instanceof WaitlistConfigError) {
      return NextResponse.json(
        { ok: false, error: e.code, message: e.message },
        { status: 503 }
      );
    }
    if (e instanceof WaitlistDbError) {
      console.error("[api/waitlist] db", e.message, e.dbCode);
      // Missing table is a common setup miss
      const missingTable =
        e.dbCode === "42P01" ||
        e.message.toLowerCase().includes("waitlist_entries");
      return NextResponse.json(
        {
          ok: false,
          error: missingTable ? "waitlist_table_missing" : e.code,
          message: missingTable
            ? "Waitlist table is missing. Apply supabase/migrations/20260709120000_waitlist_entries.sql."
            : "Could not save your spot. Try again.",
        },
        { status: 500 }
      );
    }
    console.error("[api/waitlist]", e);
    return NextResponse.json(
      {
        ok: false,
        error: "waitlist_failed",
        message: "Could not save your spot. Try again.",
      },
      { status: 500 }
    );
  }
}

/** GET /api/waitlist - readiness only (no list of emails). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    ready: isWaitlistBackendReady(),
  });
}
