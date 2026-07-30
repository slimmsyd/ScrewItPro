import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  decideRouteAccess,
  isPublicPath,
} from "@/lib/auth/route-guards";
import {
  roleFromAuthUser,
  statusFromAuthUser,
} from "@/lib/auth/roles";
import { JOIN_PATH } from "@/lib/site";

/**
 * Refresh Supabase Auth cookies + coarse route guards (Slice 2).
 *
 * Cookie trap: every redirect MUST copy cookies from supabaseResponse or a
 * token refresh produces a login loop only after ~1h.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const clearLegacySession = (res: NextResponse) => {
    if (request.cookies.has("sip_session")) {
      res.cookies.set("sip_session", "", { path: "/", maxAge: 0 });
    }
    return res;
  };

  /** Copy refreshed auth cookies onto a new response (redirect / rewrite). */
  const withSessionCookies = (res: NextResponse) => {
    supabaseResponse.cookies.getAll().forEach((c) => {
      res.cookies.set(c.name, c.value);
    });
    return clearLegacySession(res);
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const role = roleFromAuthUser(user);
  const status = statusFromAuthUser(user);

  // Public paths: still refresh session cookies, no gate
  if (isPublicPath(pathname)) {
    return clearLegacySession(supabaseResponse);
  }

  const decision = decideRouteAccess({
    pathname,
    authenticated: Boolean(user),
    role,
    status,
  });

  if (decision.action === "allow") {
    return clearLegacySession(supabaseResponse);
  }

  if (decision.action === "login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = JOIN_PATH;
    loginUrl.search = "";
    loginUrl.searchParams.set("mode", "login");
    loginUrl.searchParams.set("return_to", decision.returnTo);
    return withSessionCookies(NextResponse.redirect(loginUrl));
  }

  if (decision.action === "not_available") {
    const u = request.nextUrl.clone();
    u.pathname = "/403";
    u.search = "reason=not_available";
    return withSessionCookies(NextResponse.redirect(u));
  }

  // forbidden
  const u = request.nextUrl.clone();
  u.pathname = "/403";
  u.search = decision.reason
    ? `reason=${encodeURIComponent(decision.reason)}`
    : "";
  return withSessionCookies(NextResponse.redirect(u));
}
