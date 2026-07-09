import { NextResponse } from "next/server";
import {
 buildGoogleAuthUrl,
 getAppOrigin,
 isGoogleOAuthConfigured,
} from "@/lib/auth/google";

/**
 * GET /auth/google
 * Starts Google OAuth - redirects the browser to Google consent.
 */
export async function GET(request: Request) {
 if (!isGoogleOAuthConfigured()) {
 return NextResponse.redirect(
 new URL("/join?error=google_not_configured", request.url)
 );
 }

 const { origin: requestOrigin } = new URL(request.url);
 const origin = getAppOrigin(requestOrigin);

 // CSRF state - validated on callback
 const state = crypto.randomUUID();

 const res = NextResponse.redirect(buildGoogleAuthUrl({ origin, state }));
 res.cookies.set("sip_oauth_state", state, {
 httpOnly: true,
 secure: process.env.NODE_ENV === "production",
 sameSite: "lax",
 path: "/",
 maxAge: 60 * 10, // 10 minutes
 });
 return res;
}
