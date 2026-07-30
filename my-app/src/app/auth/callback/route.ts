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

  // Boundary trace. If NOTHING from [auth/callback] appears in the dev server
  // log after a Google sign-in, this route was never reached — Supabase sent the
  // browser to the Site URL instead, which means /auth/callback is missing from
  // Authentication → URL Configuration → Redirect URLs.
  console.info(
    `[auth/callback] hit origin=${origin} code=${code ? "present" : "MISSING"} error=${
      oauthError ?? "none"
    }`
  );

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
    // A PKCE verifier-cookie mismatch lands here ("both auth code and code
    // verifier should be non-empty") — it means the flow started on a different
    // origin than it returned to, not that Google rejected the user.
    console.error(
      `[auth/callback] exchange FAILED — ${error?.message ?? "no user email on session"}`
    );
    return NextResponse.redirect(`${origin}/join?error=auth_failed`);
  }

  console.info(
    `[auth/callback] session established for ${user.email} — waitlistReady=${isWaitlistBackendReady()}`
  );

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
      const entry = await upsertWaitlistEntry({
        email: user.email,
        name,
        picture,
        provider: "google",
        source: "join_google",
        convertedUserId: user.id,
      });
      // created=false means a re-join: no email and no CRM mirror, by design.
      console.info(
        `[auth/callback] waitlist upsert ok created=${entry.created} position=${entry.position}`
      );
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

  // Post-login routing (Slice 2.5): honor safe return_to, else role home.
  const returnToRaw = searchParams.get("return_to");
  const { safeReturnTo, portalHomeFor, JOIN_PATH } = await import("@/lib/site");
  const { roleFromAuthUser } = await import("@/lib/auth/roles");
  const role = roleFromAuthUser(user);
  const dest =
    returnToRaw && returnToRaw.length > 0
      ? safeReturnTo(returnToRaw, portalHomeFor(role))
      : `${JOIN_PATH}?joined=1`;

  // Absolute path only
  if (dest.startsWith("http")) {
    return NextResponse.redirect(`${origin}${JOIN_PATH}?joined=1`);
  }
  return NextResponse.redirect(
    dest.startsWith("/") ? `${origin}${dest}` : `${origin}/${dest}`
  );
}
