import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";
import { getReferralsForUser } from "@/lib/referrals";

/**
 * GET /api/customer/referrals
 * Signed-in: personal code, points balance, recent referred friends.
 */
export async function GET() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "referrals_not_configured",
        message: "Supabase is not configured.",
      },
      { status: 503 }
    );
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "referrals_not_configured",
        message: "Supabase is not configured.",
      },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json(
      {
        ok: false,
        error: "unauthorized",
        message: "Sign in to view your referral link.",
      },
      { status: 401 }
    );
  }

  try {
    const payload = await getReferralsForUser(user.id);
    return NextResponse.json({ ok: true, ...payload });
  } catch (e) {
    console.error("[api/customer/referrals]", e);
    return NextResponse.json(
      {
        ok: false,
        error: "referrals_failed",
        message: "Could not load referrals. Try again.",
      },
      { status: 500 }
    );
  }
}
