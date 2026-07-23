/**
 * Progressive portal nav — only ship links for routes that exist.
 * Add Dashboard / Notifications / Referrals / Support when those pages land.
 */
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

/** Phase 0 shipped routes only — no dead links. */
export const PORTAL_NAV_SHIPPED: PortalNavItem[] = [
  {
    key: "jobs",
    href: "/jobs",
    label: "My Jobs",
    icon: "Package",
    showCount: true,
  },
  {
    key: "account",
    href: "/account",
    label: "Account",
    icon: "User",
  },
];

/** Home for portal logo until /dashboard ships. */
export const PORTAL_HOME_HREF = "/jobs";

/**
 * Map pathname → active nav key.
 * Job tracker lives under /orders/[id]/track for now.
 */
export function portalActiveKey(pathname: string | null): PortalNavKey | null {
  if (!pathname) return null;
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return "dashboard";
  }
  if (pathname === "/jobs" || pathname.startsWith("/jobs/")) {
    return "jobs";
  }
  if (pathname.includes("/orders/") && pathname.includes("/track")) {
    return "jobs";
  }
  if (pathname === "/account" || pathname.startsWith("/account/")) {
    return "account";
  }
  if (pathname.startsWith("/notifications")) return "notifications";
  if (pathname.startsWith("/referrals")) return "referrals";
  if (pathname.startsWith("/support")) return "support";
  return null;
}
