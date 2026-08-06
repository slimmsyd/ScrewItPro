/**
 * Progressive admin nav - full kit IA, only shipped routes are clickable.
 * Source IA: ui_kits admin-export Admin.html NAV.
 */

export type AdminNavKey =
  | "overview"
  | "orders"
  | "board"
  | "schedule"
  | "customers"
  | "team"
  | "payments"
  | "reports"
  | "leads"
  | "settings"
  | "emails";

export type AdminNavIcon =
  | "LayoutDashboard"
  | "Package"
  | "Columns3"
  | "CalendarDays"
  | "Users"
  | "HardHat"
  | "CreditCard"
  | "BarChart3"
  | "Inbox"
  | "Settings"
  | "Mail";

export type AdminNavItem = {
  key: AdminNavKey;
  href: string;
  label: string;
  icon: AdminNavIcon;
  /** When false, shown disabled - kit roadmap visible, not navigable */
  shipped: boolean;
  section?: "ops" | "people" | "money" | "system";
};

/**
 * Full kit sidebar. Toggle `shipped` when a page lands.
 * Leads is pre-kit but real; Settings is Slice 1.
 */
export const ADMIN_NAV: AdminNavItem[] = [
  {
    key: "overview",
    href: "/admin/overview",
    label: "Overview",
    icon: "LayoutDashboard",
    shipped: false,
    section: "ops",
  },
  {
    key: "orders",
    href: "/admin/orders",
    label: "Orders",
    icon: "Package",
    shipped: false,
    section: "ops",
  },
  {
    key: "board",
    href: "/admin/board",
    label: "Today's Board",
    icon: "Columns3",
    shipped: false,
    section: "ops",
  },
  {
    key: "schedule",
    href: "/admin/schedule",
    label: "Schedule",
    icon: "CalendarDays",
    shipped: false,
    section: "ops",
  },
  {
    key: "customers",
    href: "/admin/customers",
    label: "Customers",
    icon: "Users",
    shipped: false,
    section: "people",
  },
  {
    key: "team",
    href: "/admin/team",
    label: "Team",
    icon: "HardHat",
    shipped: false,
    section: "people",
  },
  {
    key: "payments",
    href: "/admin/payments",
    label: "Payments",
    icon: "CreditCard",
    shipped: false,
    section: "money",
  },
  {
    key: "reports",
    href: "/admin/reports",
    label: "Reports",
    icon: "BarChart3",
    shipped: false,
    section: "money",
  },
  {
    key: "leads",
    href: "/admin/leads",
    label: "Leads",
    icon: "Inbox",
    shipped: true,
    section: "system",
  },
  {
    key: "settings",
    href: "/admin/settings",
    label: "Settings",
    icon: "Settings",
    shipped: true,
    section: "system",
  },
  {
    key: "emails",
    href: "/admin/emails",
    label: "Email templates",
    icon: "Mail",
    shipped: false,
    section: "system",
  },
];

export const ADMIN_SHELL_HOME = "/admin/settings";

export function adminActiveKey(pathname: string | null): AdminNavKey | null {
  if (!pathname) return null;
  if (pathname === "/admin" || pathname === "/admin/") return "settings";
  if (pathname.startsWith("/admin/settings")) return "settings";
  if (pathname.startsWith("/admin/leads")) return "leads";
  if (pathname.startsWith("/admin/emails")) return "emails";
  if (pathname.startsWith("/admin/overview")) return "overview";
  if (pathname.startsWith("/admin/orders")) return "orders";
  if (pathname.startsWith("/admin/board")) return "board";
  if (pathname.startsWith("/admin/schedule")) return "schedule";
  if (pathname.startsWith("/admin/customers")) return "customers";
  if (pathname.startsWith("/admin/team")) return "team";
  if (pathname.startsWith("/admin/payments")) return "payments";
  if (pathname.startsWith("/admin/reports")) return "reports";
  return null;
}

export function adminPageTitle(key: AdminNavKey | null): string {
  if (!key) return "Admin";
  return ADMIN_NAV.find((n) => n.key === key)?.label ?? "Admin";
}
