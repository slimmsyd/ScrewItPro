export type OAuthProvider = "google";

/**
 * Start OAuth for the join page.
 *
 * Google: always navigate to /auth/google - server validates secrets.
 * (Do NOT check GOOGLE_CLIENT_* on the client; Next only exposes NEXT_PUBLIC_*)
 */
export async function signInWithProvider(provider: OAuthProvider) {
  if (provider === "google") {
    // Server route reads GOOGLE_CLIENT_ID / SECRET from .env.local
    window.location.assign("/auth/google");
    return;
  }

  throw new Error(`Unsupported OAuth provider: ${provider}`);
}
