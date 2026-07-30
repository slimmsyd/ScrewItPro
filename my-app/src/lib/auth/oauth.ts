export type OAuthProvider = "google";

/**
 * Start OAuth for the join page.
 *
 * Google: always navigate to /auth/google - server validates secrets.
 * (Do NOT check GOOGLE_CLIENT_* on the client; Next only exposes NEXT_PUBLIC_*)
 */
export async function signInWithProvider(provider: OAuthProvider) {
  if (provider === "google") {
    // Forward return_to so post-login lands on the right portal path.
    const params = new URLSearchParams(window.location.search);
    const returnTo = params.get("return_to");
    const q = returnTo
      ? `?return_to=${encodeURIComponent(returnTo)}`
      : "";
    window.location.assign(`/auth/google${q}`);
    return;
  }

  throw new Error(`Unsupported OAuth provider: ${provider}`);
}
