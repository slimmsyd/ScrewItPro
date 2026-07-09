import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  fetchGoogleUser,
  getAppOrigin,
  isGoogleOAuthConfigured,
} from "@/lib/auth/google";
import {
  isWaitlistBackendReady,
  upsertWaitlistEntry,
  WaitlistConfigError,
  WaitlistDbError,
} from "@/lib/waitlist";

/**
 * GET /auth/callback
 * Google redirects here with ?code=…&state=…
 * Exchange code → tokens → userinfo → waitlist upsert → session cookie → /join success.
 *
 * Must match Google Cloud "Authorized redirect URIs" exactly:
 *   http://localhost:3000/auth/callback
 *   https://your-domain.com/auth/callback
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams, origin: requestOrigin } = url;
  const origin = getAppOrigin(requestOrigin);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(
      `${origin}/join?error=${encodeURIComponent(oauthError)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/join?error=missing_code`);
  }

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(`${origin}/join?error=google_not_configured`);
  }

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("sip_oauth_state")?.value;

  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(`${origin}/join?error=invalid_state`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code, origin);
    const user = await fetchGoogleUser(tokens.access_token);

    if (!user.email) {
      return NextResponse.redirect(`${origin}/join?error=auth_failed`);
    }

    let position: number | null = null;

    if (isWaitlistBackendReady()) {
      try {
        const entry = await upsertWaitlistEntry({
          email: user.email,
          name: user.name ?? user.given_name ?? null,
          picture: user.picture ?? null,
          provider: "google",
          source: "join_google",
        });
        position = entry.position;
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
    } else {
      // OAuth succeeded but storage not wired - still show success with soft warning
      console.warn(
        "[auth/callback] Supabase waitlist not configured; session only"
      );
    }

    const session = {
      email: user.email,
      name: user.name ?? user.given_name ?? "",
      picture: user.picture ?? "",
      provider: "google" as const,
      position,
      at: Date.now(),
    };

    const res = NextResponse.redirect(`${origin}/join?joined=1`);
    res.cookies.set("sip_session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    res.cookies.set("sip_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "auth_failed";
    console.error("[auth/callback]", msg);
    return NextResponse.redirect(
      `${origin}/join?error=${encodeURIComponent("auth_failed")}`
    );
  }
}
