import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh Supabase Auth cookies on each request.
 * Required for App Router so server components / route handlers see a live session.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Expire the legacy hand-rolled session cookie. Nothing reads it since Google
  // moved to Supabase Auth; clearing it stops a stale 7-day cookie from looking
  // like a signed-in user.
  const clearLegacySession = (res: NextResponse) => {
    if (request.cookies.has("sip_session")) {
      res.cookies.set("sip_session", "", { path: "/", maxAge: 0 });
    }
    return res;
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return clearLegacySession(supabaseResponse);
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touches the session so tokens refresh when needed
  await supabase.auth.getUser();

  return clearLegacySession(supabaseResponse);
}
