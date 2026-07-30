import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppOrigin } from "@/lib/auth/origin";
import { JOIN_PATH } from "@/lib/site";
import {
  normalizeReferralCode,
  REFERRAL_COOKIE,
  referralCookieOptions,
} from "@/lib/referrals";

/**
 * GET /r/{code}
 * Validate opaque referral code, set sip_ref cookie, redirect to join/signup.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  const { code: raw } = await context.params;
  const code = normalizeReferralCode(raw);
  const origin = getAppOrigin(new URL(request.url).origin);
  const secure = origin.startsWith("https");

  if (!code) {
    return NextResponse.redirect(`${origin}${JOIN_PATH}?mode=signup`);
  }

  let valid = false;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("id")
      .eq("referral_code", code)
      .eq("status", "active")
      .maybeSingle();
    valid = Boolean(data?.id);
  } catch (e) {
    console.error("[r/code] lookup failed", e);
    // Still set cookie if service role missing — claim will no-op on bad codes
  }

  const dest = valid
    ? `${origin}${JOIN_PATH}?mode=signup&ref=${encodeURIComponent(code)}`
    : `${origin}${JOIN_PATH}?mode=signup`;

  const res = NextResponse.redirect(dest);
  if (valid) {
    res.cookies.set(REFERRAL_COOKIE, code, referralCookieOptions(secure));
  }
  return res;
}
