/**
 * Product mode on this branch (`develop`).
 * - "quote" = real site CTAs → Get-a-Price journey (no waitlist share).
 * - "waitlist" remains on `main` until cutover — do not flip production without a plan.
 */
export type SiteMode = "waitlist" | "quote";
/** Flip to "waitlist" only if you intentionally revive marketing-beta CTAs. */
export const SITE_MODE: SiteMode = "quote";

/** Derived flag — compare via helper so TS does not collapse the mode literal. */
export function siteIsWaitlist(mode: SiteMode = SITE_MODE): boolean {
  return mode === "waitlist";
}
export const isWaitlist = siteIsWaitlist(SITE_MODE);

export const ASSETS = {
  logoS: "/assets/logo-icon-s.png",
  logoSWhite: "/assets/logo-s-white.png",
  logoWordmark: "/assets/logo-primary-full-color.jpg",
  logoDeep: "/assets/logo-icon-deep-blue.png",
  logoElectric: "/assets/logo-icon-electric-blue.jpg",
  mascot: "/assets/mascot-wave.jpg",
  audiencesCrew: "/assets/team-community.png",
  /** Shared brand mark for favicons / fallbacks (deep blue S) */
  brandIcon: "/assets/logo-icon-deep-blue.png",
} as const;

export const CTA_LABEL = isWaitlist ? "Join Now" : "Get a Free Quote";
export const JOIN_PATH = "/join";
/** Get-a-Price quote journey (Where → What → Price). */
export const QUOTE_PATH = "/quote/where";
export const QUOTE_ITEMS_PATH = "/quote/items";
export const QUOTE_PRICE_PATH = "/quote/price";
/** AEO landing page targeting "furniture assembly with pickup and delivery in Houston". */
export const HOUSTON_ASSEMBLY_PATH = "/furniture-assembly-pickup-delivery-houston";
export const PRIVACY_PATH = "/privacy";
export const TERMS_PATH = "/terms";

// ─── Customer portal (Slice 2: real URL prefix for middleware guards) ───

export const CUSTOMER_HOME_PATH = "/customer/jobs";
export const CUSTOMER_JOBS_PATH = "/customer/jobs";
export const CUSTOMER_ACCOUNT_PATH = "/customer/account";
export const CUSTOMER_NOTIFICATIONS_PATH = "/customer/notifications";
export const CUSTOMER_REFERRALS_PATH = "/customer/referrals";
export const CUSTOMER_ORDERS_PATH = "/customer/orders";

/** Order confirmation page. */
export function customerOrderPath(orderId: string, query = ""): string {
  const q = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  return `${CUSTOMER_ORDERS_PATH}/${encodeURIComponent(orderId)}${q}`;
}

/** Live tracker page. */
export function customerOrderTrackPath(orderId: string, query = ""): string {
  const q = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  return `${CUSTOMER_ORDERS_PATH}/${encodeURIComponent(orderId)}/track${q}`;
}

// ─── Admin ───

/**
 * Admin sign-in. Public by design (see route-guards): the rest of /admin
 * requires a session, so if this page were gated too, a signed-out admin would
 * be bounced to the customer /join page and could never reach their own door.
 */
export const ADMIN_SIGNIN_PATH = "/admin/signin";
/** Where a verified admin lands. Leads is the only admin screen built today. */
export const ADMIN_HOME_PATH = "/admin/leads";

export type SipRole = "customer" | "admin" | "technician" | "driver";

/** Post-login / 403 home for a role. Staff portals not shipped → 403 not_available. */
export function portalHomeFor(role: SipRole | string | null | undefined): string {
  switch (role) {
    case "admin":
      return "/admin/leads";
    case "technician":
    case "driver":
      return "/403?reason=not_available";
    case "customer":
    default:
      return CUSTOMER_HOME_PATH;
  }
}

/** Prefixes allowed in return_to after login (open-redirect guard). */
export const SAFE_RETURN_PREFIXES = [
  "/customer",
  "/quote",
  "/join",
  "/admin",
  "/checkout",
] as const;

/**
 * Validate return_to: same-origin path only, allowlisted prefix.
 * Rejects protocol-relative, absolute external, and unknown prefixes.
 */
export function safeReturnTo(
  raw: string | null | undefined,
  fallback = CUSTOMER_HOME_PATH
): string {
  if (!raw || typeof raw !== "string") return fallback;
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  if (t.includes("://") || t.includes("\\")) return fallback;
  const pathOnly = t.split("?")[0]?.split("#")[0] ?? t;
  const ok = SAFE_RETURN_PREFIXES.some(
    (p) => pathOnly === p || pathOnly.startsWith(`${p}/`)
  );
  return ok ? t : fallback;
}
