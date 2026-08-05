/**
 * Pure route-guard helpers — unit-tested (Slice 2.0).
 * Middleware uses these so quote public access is regression-proof.
 */

export const PUBLIC_PREFIXES = [
  "/",
  "/join",
  "/quote",
  "/auth",
  "/api",
  "/privacy",
  "/terms",
  "/furniture-assembly-pickup-delivery-houston",
  "/checkout",
  "/dev",
  "/403",
] as const;

/** Paths that require any signed-in session. */
export const CUSTOMER_PREFIX = "/customer";

/**
 * Public leaf inside an otherwise-gated tree.
 *
 * /admin/* sends anonymous visitors to the customer join page. The admin
 * sign-in screen lives under that prefix, so without this exception a
 * signed-out admin gets redirected away from the very page that signs them in.
 */
export const PUBLIC_ADMIN_LEAVES = ["/admin/signin"] as const;

/** Staff prefixes — claim must match (or layout re-asserts). */
export const STAFF_PREFIXES = {
  admin: "/admin",
  technician: "/tech",
  driver: "/driver",
} as const;

export function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix === "/") {
    return pathname === "/" || pathname === "";
  }
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** True when pathname is allowlisted for anonymous access. */
export function isPublicPath(pathname: string): boolean {
  // Explicit public trees
  if (pathMatchesPrefix(pathname, "/quote")) return true;
  if (pathMatchesPrefix(pathname, "/join")) return true;
  if (pathMatchesPrefix(pathname, "/auth")) return true;
  if (pathMatchesPrefix(pathname, "/api")) return true;
  if (pathMatchesPrefix(pathname, "/checkout")) return true;
  if (pathMatchesPrefix(pathname, "/dev")) return true;
  if (pathMatchesPrefix(pathname, "/privacy")) return true;
  if (pathMatchesPrefix(pathname, "/terms")) return true;
  if (pathMatchesPrefix(pathname, "/furniture-assembly-pickup-delivery-houston"))
    return true;
  if (pathMatchesPrefix(pathname, "/403")) return true;
  // Public leaves inside gated trees (admin sign-in) — must come before the
  // /admin prefix gate in decideRouteAccess, which this function precedes.
  if (PUBLIC_ADMIN_LEAVES.some((p) => pathname === p)) return true;
  // Static marketing home + known public leaves
  if (pathname === "/" || pathname === "") return true;
  // Next assets handled by middleware matcher skip
  return false;
}

/** True when /quote/* would incorrectly require auth — used in tests. */
export function quotePathsStayPublic(pathname: string): boolean {
  return pathMatchesPrefix(pathname, "/quote") && isPublicPath(pathname);
}

export type GuardDecision =
  | { action: "allow" }
  | { action: "login"; returnTo: string }
  | { action: "forbidden"; reason?: string }
  | { action: "not_available" };

/**
 * Coarse UX gate only — never the sole authz for data.
 * @param role from JWT claim (default customer)
 * @param status from JWT claim
 */
export function decideRouteAccess(opts: {
  pathname: string;
  authenticated: boolean;
  role: string;
  status: string;
}): GuardDecision {
  const { pathname, authenticated, role, status } = opts;

  if (isPublicPath(pathname)) {
    return { action: "allow" };
  }

  if (pathMatchesPrefix(pathname, CUSTOMER_PREFIX)) {
    if (!authenticated) {
      return { action: "login", returnTo: pathname };
    }
    if (status === "suspended") {
      return { action: "forbidden", reason: "suspended" };
    }
    return { action: "allow" };
  }

  if (pathMatchesPrefix(pathname, STAFF_PREFIXES.admin)) {
    if (!authenticated) {
      return { action: "login", returnTo: pathname };
    }
    if (status === "suspended") {
      return { action: "forbidden", reason: "suspended" };
    }
    // Layout re-asserts admin from profiles; middleware allows any session
    // through so requireAdmin can show a proper 403 (not login loop).
    return { action: "allow" };
  }

  if (pathMatchesPrefix(pathname, STAFF_PREFIXES.technician)) {
    if (!authenticated) return { action: "login", returnTo: pathname };
    if (role !== "technician") {
      // Portal not shipped — not_available for everyone including techs
      // until /tech/* exists; still guard prefix.
      return role === "technician"
        ? { action: "not_available" }
        : { action: "forbidden" };
    }
    return { action: "not_available" };
  }

  if (pathMatchesPrefix(pathname, STAFF_PREFIXES.driver)) {
    if (!authenticated) return { action: "login", returnTo: pathname };
    if (role !== "driver") {
      return { action: "forbidden" };
    }
    return { action: "not_available" };
  }

  // Unknown private-looking paths: allow (marketing pages etc.)
  return { action: "allow" };
}
