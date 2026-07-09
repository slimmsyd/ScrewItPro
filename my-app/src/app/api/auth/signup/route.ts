import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isWaitlistBackendReady,
  upsertWaitlistEntry,
  WaitlistConfigError,
  WaitlistDbError,
} from "@/lib/waitlist";

/**
 * POST /api/auth/signup
 * Create a Supabase Auth user (email confirmed immediately — no confirmation email)
 * and enroll them on the waitlist. Custom transactional email can be added later.
 */
const bodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(3)
    .max(254)
    .email("Invalid email")
    .transform((v) => v.toLowerCase()),
  password: z.string().min(8).max(72),
  name: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
});

export async function POST(request: Request) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "auth_not_configured",
        message: "Supabase is not configured.",
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

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true, // skip Supabase confirmation emails for now
        user_metadata: {
          full_name: input.name ?? undefined,
        },
      });

    if (createError || !created.user) {
      const msg = createError?.message?.toLowerCase() ?? "";
      if (
        msg.includes("already") ||
        msg.includes("registered") ||
        createError?.status === 422
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: "email_taken",
            message: "That email already has an account.",
          },
          { status: 409 }
        );
      }
      console.error("[api/auth/signup]", createError?.message);
      return NextResponse.json(
        {
          ok: false,
          error: "signup_failed",
          message: createError?.message ?? "Could not create account.",
        },
        { status: 500 }
      );
    }

    const userId = created.user.id;
    let position: number | null = null;

    if (isWaitlistBackendReady()) {
      try {
        const entry = await upsertWaitlistEntry({
          email: input.email,
          name: input.name,
          picture: null,
          provider: "email",
          source: "join_signup",
          convertedUserId: userId,
        });
        position = entry.position;
      } catch (e) {
        if (e instanceof WaitlistConfigError) {
          return NextResponse.json(
            {
              ok: true,
              userId,
              waitlist: null,
              warning: "waitlist_not_configured",
            },
            { status: 201 }
          );
        }
        if (e instanceof WaitlistDbError) {
          console.error("[api/auth/signup] waitlist", e.message, e.dbCode);
          return NextResponse.json(
            {
              ok: true,
              userId,
              waitlist: null,
              warning:
                e.dbCode === "42P01"
                  ? "waitlist_table_missing"
                  : "waitlist_failed",
            },
            { status: 201 }
          );
        }
        throw e;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        userId,
        waitlist:
          position != null
            ? { email: input.email, position }
            : null,
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
    console.error("[api/auth/signup]", e);
    return NextResponse.json(
      {
        ok: false,
        error: "signup_failed",
        message: "Could not create account.",
      },
      { status: 500 }
    );
  }
}
