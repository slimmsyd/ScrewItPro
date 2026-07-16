/**
 * Canonical app origin for OAuth redirects.
 *
 * Must exactly match an entry in Supabase → Authentication → URL Configuration
 * → Redirect URLs. Derives from NEXT_PUBLIC_APP_URL so it self-corrects at the
 * domain cutover.
 */
export function getAppOrigin(requestOrigin?: string): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (requestOrigin) return requestOrigin.replace(/\/$/, "");
  return "http://localhost:3000";
}
