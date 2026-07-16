import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin } from "@/lib/auth/origin";
import {
  isWaitlistBackendReady,
  upsertWaitlistEntry,
  WaitlistConfigError,
  WaitlistDbError,
} from "@/lib/waitlist";

/**
 * GET /auth/callback
 * Supabase redirects here with ?code=… once Google has vouched for the user.
 *
 * exchangeCodeForSession is what makes this a real sign-in: it creates the
 * auth.users row, which fires handle_new_user, which creates the profiles row.
 * The previous hand-rolled flow talked to Google directly and created neither —
 * it wrote an unsigned sip_session cookie, so Google users had no account and
 * could never convert from waitlist lead to customer.
 *
 * Supabase → Authentication → URL Configuration → Redirect URLs must allow:
 *   http://localhost:3000/auth/callback
 *   https://<domain>/auth/callback
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin: requestOrigin } = url;
  const origin = getAppOrigin(requestOrigin);

  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/join?error=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/join?error=missing_code`);
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.redirect(`${origin}/join?error=auth_not_configured`);
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  const user = data?.user;

  if (error || !user?.email) {
    console.error("[auth/callback] exchange", error?.message);
    return NextResponse.redirect(`${origin}/join?error=auth_failed`);
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (meta.full_name as string | undefined) ??
    (meta.name as string | undefined) ??
    null;
  const picture =
    (meta.avatar_url as string | undefined) ??
    (meta.picture as string | undefined) ??
    null;

  // Keep the lead row and link it to the account they just created. This is
  // what flips a waitlist lead into a converted user (converted_user_id).
  if (isWaitlistBackendReady()) {
    try {
      await upsertWaitlistEntry({
        email: user.email,
        name,
        picture,
        provider: "google",
        source: "join_google",
        convertedUserId: user.id,
      });
    } catch (e) {
      if (e instanceof WaitlistConfigError) {
        return NextResponse.redirect(
          `${origin}/join?error=waitlist_not_configured`
        );
      }
      if (e instanceof WaitlistDbError) {
        console.error("[auth/callback] waitlist", e.message, e.dbCode);
        const missingTable =
          e.dbCode === "42P01" ||
          e.message.toLowerCase().includes("waitlist_entries");
        return NextResponse.redirect(
          `${origin}/join?error=${encodeURIComponent(
            missingTable ? "waitlist_table_missing" : "waitlist_failed"
          )}`
        );
      }
      throw e;
    }
  }

  return NextResponse.redirect(`${origin}/join?joined=1`);
}
