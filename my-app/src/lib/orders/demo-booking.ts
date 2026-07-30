/**
 * Soft-gate demo booking (non-production only).
 * Creates a real owned order with customer-visible lifecycle so My Jobs works
 * without Stripe deposit hooks. Vault: fail closed in production.
 */

/** Server + client safe: Next inlines NODE_ENV at build time. */
export function isDemoBookingEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}
