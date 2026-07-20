/**
 * Central env access for Screw It Pro.
 * Public vars are safe for the browser; server vars throw if missing when required.
 */

function getEnv(key: string, optional = false): string {
 const value = process.env[key];
 if (!value && !optional) {
 throw new Error(
 `Missing required environment variable: ${key}. Copy .env.example → .env.local and fill it in.`
 );
 }
 return value ?? "";
}

/** Public (NEXT_PUBLIC_*) - safe on client and server */
export const publicEnv = {
 appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
 appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Screw It Pro",
 supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
 supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
 stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
 /** Maps JS API + Places (browser) */
 googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
 /** GA4 measurement ID, e.g. G-XXXXXXXX */
 googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "",
} as const;

/** Server-only secrets - import only from server components / route handlers */
export const serverEnv = {
 get supabaseServiceRoleKey() {
 return getEnv("SUPABASE_SERVICE_ROLE_KEY");
 },
 get stripeSecretKey() {
 return getEnv("STRIPE_SECRET_KEY");
 },
 get stripeWebhookSecret() {
 return getEnv("STRIPE_WEBHOOK_SECRET", true);
 },
 get resendApiKey() {
 return getEnv("RESEND_API_KEY");
 },
 get resendFromEmail() {
 return (
 process.env.RESEND_FROM_EMAIL ??
 "Screw It Pro <onboarding@resend.dev>"
 );
 },
 get deepseekApiKey() {
 return getEnv("DEEPSEEK_API_KEY");
 },
 get deepseekBaseUrl() {
 return process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
 },
 get deepseekModel() {
 return process.env.DEEPSEEK_MODEL ?? "deepseek-chat";
 },
 /** Optional server Maps key (Geocoding / Distance Matrix). Falls back to public key. */
 get googleMapsServerKey() {
 return getEnv("GOOGLE_MAPS_SERVER_KEY", true);
 },
 get googleClientId() {
 return getEnv("GOOGLE_CLIENT_ID", true);
 },
 get googleClientSecret() {
 return getEnv("GOOGLE_CLIENT_SECRET", true);
 },
 /** n8n webhook that mirrors people (waitlist + inquiries) into the Users CRM sheet. Optional (gated). */
 get n8nCrmWebhookUrl() {
 return getEnv("N8N_CRM_WEBHOOK_URL", true);
 },
 /**
  * Internal recipients for new-lead notifications (waitlist joins + inquiries).
  * Comma-separated — Resend accepts an array in `to`, so the ops list can
  * change without a code deploy.
  * Falls back to the older INQUIRY_NOTIFY_EMAIL so existing envs keep working.
  * Optional: empty means no team notification is sent.
  */
 get teamNotifyEmails(): string[] {
 const raw =
 process.env.TEAM_NOTIFY_EMAILS ?? process.env.INQUIRY_NOTIFY_EMAIL ?? "";
 return raw
 .split(",")
 .map((e) => e.trim())
 .filter(Boolean);
 },
} as const;

/** Which integrations have non-empty env values (no secrets exposed). */
export function getEnvStatus() {
 const has = (key: string) => Boolean(process.env[key]?.trim());

 return {
 app: {
 url: publicEnv.appUrl,
 name: publicEnv.appName,
 },
 supabase: {
 configured:
 has("NEXT_PUBLIC_SUPABASE_URL") &&
 has("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
 serviceRoleConfigured: has("SUPABASE_SERVICE_ROLE_KEY"),
 },
 stripe: {
 configured:
 has("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") &&
 has("STRIPE_SECRET_KEY"),
 webhookConfigured: has("STRIPE_WEBHOOK_SECRET"),
 },
 resend: {
 configured: has("RESEND_API_KEY"),
 fromEmail: process.env.RESEND_FROM_EMAIL ?? null,
 },
 deepseek: {
 configured: has("DEEPSEEK_API_KEY"),
 model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
 baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
 },
 google: {
 mapsConfigured: has("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"),
 mapsServerConfigured: has("GOOGLE_MAPS_SERVER_KEY"),
 analyticsConfigured: has("NEXT_PUBLIC_GOOGLE_ANALYTICS_ID"),
 oauthConfigured:
 has("GOOGLE_CLIENT_ID") && has("GOOGLE_CLIENT_SECRET"),
 },
 framerMotion: {
 configured: true,
 note: "Bundled client library - no API key required",
 },
 n8n: {
 crmWebhookConfigured: has("N8N_CRM_WEBHOOK_URL"),
 },
 notifications: {
 // Whether anyone is actually pinged on a new lead. Previously invisible:
 // INQUIRY_NOTIFY_EMAIL was read straight from process.env and reported nowhere,
 // so a silent typo meant no team ever knew leads were arriving.
 teamNotifyConfigured:
 has("TEAM_NOTIFY_EMAILS") || has("INQUIRY_NOTIFY_EMAIL"),
 teamNotifyCount: serverEnv.teamNotifyEmails.length,
 },
 };
}
