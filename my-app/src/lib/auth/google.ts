/**
 * Direct Google OAuth 2.0 (authorization code) - no Supabase required.
 *
 * Google Cloud OAuth client must allow:
 * Authorized JavaScript origins: http://localhost:3000
 * Authorized redirect URIs: http://localhost:3000/auth/callback
 */

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v2/userinfo";

export function getGoogleClientId(): string {
 const id = process.env.GOOGLE_CLIENT_ID?.trim();
 if (!id) {
 throw new Error("Missing GOOGLE_CLIENT_ID in .env.local");
 }
 return id;
}

export function getGoogleClientSecret(): string {
 const secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
 if (!secret) {
 throw new Error("Missing GOOGLE_CLIENT_SECRET in .env.local");
 }
 return secret;
}

/** Canonical app origin for redirect_uri (must match Google Console exactly). */
export function getAppOrigin(requestOrigin?: string): string {
 const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
 if (fromEnv) return fromEnv;
 if (requestOrigin) return requestOrigin.replace(/\/$/, "");
 return "http://localhost:3000";
}

export function getGoogleRedirectUri(origin: string): string {
 return `${origin.replace(/\/$/, "")}/auth/callback`;
}

export function buildGoogleAuthUrl(opts: {
 origin: string;
 state: string;
}): string {
 const params = new URLSearchParams({
 client_id: getGoogleClientId(),
 redirect_uri: getGoogleRedirectUri(opts.origin),
 response_type: "code",
 scope: "openid email profile",
 access_type: "online",
 prompt: "select_account",
 state: opts.state,
 });
 return `${GOOGLE_AUTH}?${params.toString()}`;
}

export type GoogleTokens = {
 access_token: string;
 expires_in?: number;
 id_token?: string;
 scope?: string;
 token_type?: string;
};

export async function exchangeCodeForTokens(
 code: string,
 origin: string
): Promise<GoogleTokens> {
 const body = new URLSearchParams({
 code,
 client_id: getGoogleClientId(),
 client_secret: getGoogleClientSecret(),
 redirect_uri: getGoogleRedirectUri(origin),
 grant_type: "authorization_code",
 });

 const res = await fetch(GOOGLE_TOKEN, {
 method: "POST",
 headers: { "Content-Type": "application/x-www-form-urlencoded" },
 body,
 });

 const data = (await res.json()) as GoogleTokens & { error?: string; error_description?: string };
 if (!res.ok || data.error) {
 throw new Error(
 data.error_description || data.error || `Token exchange failed (${res.status})`
 );
 }
 if (!data.access_token) {
 throw new Error("No access_token returned from Google");
 }
 return data;
}

export type GoogleUser = {
 id: string;
 email: string;
 verified_email?: boolean;
 name?: string;
 given_name?: string;
 family_name?: string;
 picture?: string;
};

export async function fetchGoogleUser(
 accessToken: string
): Promise<GoogleUser> {
 const res = await fetch(GOOGLE_USERINFO, {
 headers: { Authorization: `Bearer ${accessToken}` },
 });
 const data = (await res.json()) as GoogleUser & { error?: { message?: string } };
 if (!res.ok) {
 throw new Error(
 data.error?.message || `Userinfo failed (${res.status})`
 );
 }
 if (!data.email) {
 throw new Error("Google account has no email on file");
 }
 return data;
}

export function isGoogleOAuthConfigured(): boolean {
 return Boolean(
 process.env.GOOGLE_CLIENT_ID?.trim() &&
 process.env.GOOGLE_CLIENT_SECRET?.trim()
 );
}
