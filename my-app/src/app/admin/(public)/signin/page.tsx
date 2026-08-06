import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminSignIn, {
  type AdminSignInState,
} from "@/components/admin/AdminSignIn";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_HOME_PATH, safeReturnTo } from "@/lib/site";

/**
 * /admin/signin - the admin door.
 *
 * Public by route-guard exception (PUBLIC_ADMIN_LEAVES): every other /admin
 * path bounces anonymous visitors to the customer join page, which would make
 * this page unreachable by the people it exists for.
 *
 * The access decision is made here, on the server, by requireAdmin(). The
 * component renders an already-resolved answer - it never computes access.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminSignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const welcome = params.welcome === "1";
  const rawReturn = typeof params.return_to === "string" ? params.return_to : null;
  const dest = safeReturnTo(rawReturn, ADMIN_HOME_PATH);

  const admin = await requireAdmin();

  if (admin.ok) {
    // Arriving fresh from Google gets the confirmation beat; a direct visit by
    // someone already signed in just goes where they were headed.
    if (!welcome) {
      redirect(dest);
    }
    return <AdminSignIn state="in" email={admin.email} returnTo={dest} />;
  }

  const state: AdminSignInState =
    admin.reason === "unauthenticated"
      ? "idle"
      : admin.reason === "invited"
        ? "invited"
        : admin.reason === "not_configured"
          ? "not_configured"
          : "denied";

  // A refusal names the account it refused - otherwise the reader cannot tell
  // which of their Google accounts the browser actually used.
  let email: string | null = null;
  if (state === "denied" || state === "invited") {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      email = user?.email ?? null;
    } catch {
      /* unconfigured - the screen reads fine without it */
    }
  }

  return <AdminSignIn state={state} email={email} returnTo={dest} />;
}
