import { redirect } from "next/navigation";
import AdminAppShell from "@/components/admin/AdminAppShell";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  ADMIN_SIGNIN_PATH,
  CUSTOMER_HOME_PATH,
  JOIN_PATH,
} from "@/lib/site";

/**
 * Authenticated admin chrome. Public /admin/signin lives in (public) and
 * is not wrapped here.
 */
export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await requireAdmin();

  if (!gate.ok) {
    if (gate.reason === "unauthenticated") {
      redirect(
        `${ADMIN_SIGNIN_PATH}?return_to=${encodeURIComponent("/admin/settings")}`
      );
    }
    if (gate.reason === "invited") {
      redirect(
        `${ADMIN_SIGNIN_PATH}?return_to=${encodeURIComponent("/admin/settings")}`
      );
    }
    if (gate.reason === "not_configured") {
      redirect(`${JOIN_PATH}?mode=login`);
    }
    // forbidden
    redirect(`${CUSTOMER_HOME_PATH}`);
  }

  return <AdminAppShell email={gate.email}>{children}</AdminAppShell>;
}
