import { getEnvStatus, publicEnv } from "@/lib/env";

/**
 * Payments readiness gate — the plug-and-play seam for Stripe.
 *
 * The checkout + webhook routes are fully written but stay inert until the
 * client provides Stripe credentials. Cutover = set STRIPE_SECRET_KEY +
 * NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (+ STRIPE_WEBHOOK_SECRET) and redeploy.
 */

export function isStripeReady(): boolean {
  return getEnvStatus().stripe.configured;
}

export function isStripeWebhookReady(): boolean {
  return getEnvStatus().stripe.webhookConfigured;
}

/** 50% deposit in integer cents, min 1 cent. */
export function computeDepositCents(totalCents: number): number {
  return Math.max(1, Math.round(totalCents / 2));
}

export function appUrl(): string {
  return publicEnv.appUrl.replace(/\/$/, "");
}
