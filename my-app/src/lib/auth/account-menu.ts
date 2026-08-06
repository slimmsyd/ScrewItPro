/**
 * Role-aware account dropdown config.
 * Menu is navigation UX only — never grants access. Server gates still apply.
 */
import type { SipRole } from "@/lib/auth/roles";
import {
  ADMIN_HOME_PATH,
  CUSTOMER_ACCOUNT_PATH,
  CUSTOMER_JOBS_PATH,
  CUSTOMER_NOTIFICATIONS_PATH,
} from "@/lib/site";

export type AccountMenuIcon =
  | "LayoutDashboard"
  | "User"
  | "MapPin"
  | "CreditCard"
  | "Bell"
  | "Settings"
  | "Inbox"
  | "Shield";

export type AccountMenuLink = {
  kind: "link";
  href: string;
  label: string;
  icon: AccountMenuIcon;
  /** e.g. jobs badge — only for customer My Jobs when provided */
  badgeKey?: "jobs";
};

export type AccountMenuNote = {
  kind: "note";
  text: string;
};

export type AccountMenuItem = AccountMenuLink | AccountMenuNote;

export type AccountMenuSection = {
  /** Optional section heading inside the dropdown */
  title?: string;
  items: AccountMenuItem[];
};

export type AccountMenuModel = {
  role: SipRole;
  roleLabel: string;
  sections: AccountMenuSection[];
};

export function roleLabel(role: SipRole, isSuperAdmin?: boolean): string {
  if (role === "admin") return isSuperAdmin ? "Admin" : "Admin";
  switch (role) {
    case "technician":
      return "Technician";
    case "driver":
      return "Driver";
    case "customer":
    default:
      return "Customer";
  }
}

function customerLinks(): AccountMenuLink[] {
  return [
    {
      kind: "link",
      href: CUSTOMER_JOBS_PATH,
      label: "My Jobs",
      icon: "LayoutDashboard",
      badgeKey: "jobs",
    },
    {
      kind: "link",
      href: CUSTOMER_ACCOUNT_PATH,
      label: "Account",
      icon: "User",
    },
    {
      kind: "link",
      href: `${CUSTOMER_ACCOUNT_PATH}#addresses`,
      label: "Addresses",
      icon: "MapPin",
    },
    {
      kind: "link",
      href: `${CUSTOMER_ACCOUNT_PATH}#payment`,
      label: "Payment",
      icon: "CreditCard",
    },
    {
      kind: "link",
      href: CUSTOMER_NOTIFICATIONS_PATH,
      label: "Notifications",
      icon: "Bell",
    },
  ];
}

function adminPrimaryLinks(): AccountMenuLink[] {
  return [
    {
      kind: "link",
      href: ADMIN_HOME_PATH,
      label: "Go to Admin",
      icon: "Shield",
    },
    {
      kind: "link",
      href: "/admin/settings",
      label: "Settings",
      icon: "Settings",
    },
    {
      kind: "link",
      href: "/admin/leads",
      label: "Leads",
      icon: "Inbox",
    },
  ];
}

/**
 * Highest-leverage menu map:
 * - customer: full customer shortcuts
 * - admin: admin primary + customer secondary (founder dual-use)
 * - tech/driver: honest empty state until portals ship
 */
export function accountMenuFor(
  role: SipRole,
  opts?: { isSuperAdmin?: boolean }
): AccountMenuModel {
  const label = roleLabel(role, opts?.isSuperAdmin);

  if (role === "admin") {
    return {
      role,
      roleLabel: label,
      sections: [
        { title: "Admin", items: adminPrimaryLinks() },
        {
          title: "Customer",
          items: [
            {
              kind: "link",
              href: CUSTOMER_JOBS_PATH,
              label: "My Jobs",
              icon: "LayoutDashboard",
              badgeKey: "jobs",
            },
            {
              kind: "link",
              href: CUSTOMER_ACCOUNT_PATH,
              label: "Account",
              icon: "User",
            },
          ],
        },
      ],
    };
  }

  if (role === "technician" || role === "driver") {
    return {
      role,
      roleLabel: label,
      sections: [
        {
          items: [
            {
              kind: "note",
              text:
                role === "technician"
                  ? "Workshop portal is not open yet. Sign out or ask an admin if you need access."
                  : "Driver portal is not open yet. Sign out or ask an admin if you need access.",
            },
          ],
        },
      ],
    };
  }

  return {
    role: "customer",
    roleLabel: label,
    sections: [{ items: customerLinks() }],
  };
}
