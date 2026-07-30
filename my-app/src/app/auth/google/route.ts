import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppOrigin } from "@/lib/auth/origin";

/**
 * GET /auth/google
 * Starts Google sign-in through Supabase Auth.
 *
 * Supabase owns the Google handshake and redirects back to /auth/callback with
 * a code we exchange for a real session. CSRF is covered by the PKCE verifier
 * cookie set here, so the old hand-rolled sip_oauth_state check is gone.
 *
 * Google Cloud Console must list Supabase's callback as an authorized redirect
 * URI (NOT this app's): https://<project>.supabase.co/auth/v1/callback
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { origin: requestOrigin } = url;
  const origin = getAppOrigin(requestOrigin);
  const returnTo = url.searchParams.get("return_to");
  const callback =
    returnTo && returnTo.startsWith("/")
      ? `${origin}/auth/callback?return_to=${encodeURIComponent(returnTo)}`
      : `${origin}/auth/callback`;

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.redirect(`${origin}/join?error=auth_not_configured`);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data?.url) {
    console.error("[auth/google]", error?.message);
    return NextResponse.redirect(`${origin}/join?error=auth_failed`);
  }

  return NextResponse.redirect(data.url);
}
