/**
 * Progressive portal nav — only ship links for routes that exist.
 */
import {
  CUSTOMER_ACCOUNT_PATH,
  CUSTOMER_HOME_PATH,
  CUSTOMER_JOBS_PATH,
  CUSTOMER_NOTIFICATIONS_PATH,
  CUSTOMER_ORDERS_PATH,
  CUSTOMER_REFERRALS_PATH,
} from "@/lib/site";

export type PortalNavKey =
  | "dashboard"
  | "jobs"
  | "account"
  | "notifications"
  | "referrals"
  | "support";

export type PortalNavItem = {
  key: PortalNavKey;
  href: string;
  label: string;
  /** lucide-react icon name key used by CustomerAppShell */
  icon:
    | "LayoutDashboard"
    | "Package"
    | "User"
    | "Bell"
    | "Gift"
    | "Headphones";
  /** Show active-job count pill (My Jobs only) */
  showCount?: boolean;
};

/** Phase 0 shipped routes under /customer/* */
export const PORTAL_NAV_SHIPPED: PortalNavItem[] = [
  {
    key: "jobs",
    href: CUSTOMER_JOBS_PATH,
    label: "My Jobs",
    icon: "Package",
    showCount: true,
  },
  {
    key: "account",
    href: CUSTOMER_ACCOUNT_PATH,
    label: "Account",
    icon: "User",
  },
  {
    key: "notifications",
    href: CUSTOMER_NOTIFICATIONS_PATH,
    label: "Notifications",
    icon: "Bell",
  },
  {
    key: "referrals",
    href: CUSTOMER_REFERRALS_PATH,
    label: "Refer & Earn",
    icon: "Gift",
  },
];

/** Home for portal logo until /dashboard ships. */
export const PORTAL_HOME_HREF = CUSTOMER_HOME_PATH;

/**
 * Map pathname → active nav key.
 * Job tracker lives under /customer/orders/[id]/track.
 */
export function portalActiveKey(pathname: string | null): PortalNavKey | null {
  if (!pathname) return null;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return "dashboard";
  }
  if (
    pathname === CUSTOMER_JOBS_PATH ||
    pathname.startsWith(`${CUSTOMER_JOBS_PATH}/`) ||
    pathname === "/jobs" ||
    pathname.startsWith("/jobs/")
  ) {
    return "jobs";
  }
  if (
    (pathname.startsWith(`${CUSTOMER_ORDERS_PATH}/`) ||
      pathname.startsWith("/orders/") ||
      pathname.startsWith("/customer/orders/")) &&
    pathname.includes("/track")
  ) {
    return "jobs";
  }
  if (
    pathname === CUSTOMER_ACCOUNT_PATH ||
    pathname.startsWith(`${CUSTOMER_ACCOUNT_PATH}/`) ||
    pathname === "/account" ||
    pathname.startsWith("/account/")
  ) {
    return "account";
  }
  if (
    pathname.startsWith(CUSTOMER_NOTIFICATIONS_PATH) ||
    pathname.startsWith("/notifications")
  ) {
    return "notifications";
  }
  if (
    pathname.startsWith(CUSTOMER_REFERRALS_PATH) ||
    pathname.startsWith("/referrals")
  ) {
    return "referrals";
  }
  if (pathname.startsWith("/support") || pathname.startsWith("/customer/support")) {
    return "support";
  }
  return null;
}
