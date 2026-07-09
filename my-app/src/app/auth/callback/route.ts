import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  exchangeCodeForTokens,
  fetchGoogleUser,
  getAppOrigin,
  isGoogleOAuthConfigured,
} from "@/lib/auth/google";

/**
 * GET /auth/callback
 * Google redirects here with ?code=…&state=…
 * Exchange code → tokens → userinfo → session cookie → /join success.
 *
 * Must match Google Cloud "Authorized redirect URIs" exactly:
 *   http://localhost:3000/auth/callback
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

    // Lightweight session for the waitlist success UI (no Supabase yet)
    const session = {
      email: user.email,
      name: user.name ?? user.given_name ?? "",
      picture: user.picture ?? "",
      provider: "google" as const,
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
    // Clear OAuth state
    res.cookies.set("sip_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "auth_failed";
    console.error("[auth/callback]", msg);
    return NextResponse.redirect(
      `${origin}/join?error=${encodeURIComponent("auth_failed")}`
    );
  }
}
