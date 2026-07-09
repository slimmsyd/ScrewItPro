export type OAuthProvider = "google" | "apple";

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

 if (provider === "apple") {
 throw new Error(
 "Apple Sign-In is not connected yet. Use Google or email for now."
 );
 }
}
