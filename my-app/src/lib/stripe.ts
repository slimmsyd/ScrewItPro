import Stripe from "stripe";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import { publicEnv, serverEnv } from "@/lib/env";

let stripeServer: Stripe | null = null;
let stripeBrowserPromise: Promise<StripeJs | null> | null = null;

/**
 * Server-side Stripe SDK (secret key).
 * Use in Route Handlers / Server Actions only.
 */
export function getStripe(): Stripe {
  if (!stripeServer) {
    stripeServer = new Stripe(serverEnv.stripeSecretKey, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
      appInfo: {
        name: "Screw It Pro",
        version: "0.1.0",
      },
    });
  }
  return stripeServer;
}

/**
 * Browser Stripe.js (publishable key).
 * Use for Checkout / Elements on the client.
 */
export function getStripeJs() {
  if (!publicEnv.stripePublishableKey) {
    throw new Error(
      "Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY."
    );
  }
  if (!stripeBrowserPromise) {
    stripeBrowserPromise = loadStripe(publicEnv.stripePublishableKey);
  }
  return stripeBrowserPromise;
}

export { publicEnv as stripePublicEnv };
