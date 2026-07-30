import { publicEnv } from "@/lib/env";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

export type WaitlistApiResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  entry?: {
    email: string;
    position: number;
    created: boolean;
  };
};

export type Phase = "form" | "loading" | "done";
export type Mode = "signup" | "login";

export function mapWaitlistError(
  code: string | undefined,
  t: (key: string) => string
): string {
  const map: Record<string, string> = {
    waitlist_not_configured: t("join.errWaitlistNotConfigured"),
    waitlist_table_missing: t("join.errWaitlistTableMissing"),
    waitlist_failed: t("join.errWaitlistFailed"),
    waitlist_db_error: t("join.errWaitlistFailed"),
    invalid_email: t("join.emailError"),
    invalid_json: t("join.errWaitlistFailed"),
  };
  return (code && map[code]) || t("join.errWaitlistFailed");
}

export function mapAuthError(
  codeOrMessage: string,
  t: (key: string) => string
): string {
  const m = codeOrMessage.toLowerCase();
  if (
    m === "email_taken" ||
    m.includes("already registered") ||
    m.includes("already been registered")
  ) {
    return t("join.errEmailTaken");
  }
  if (m.includes("invalid login") || m.includes("invalid credentials")) {
    return t("join.errInvalidCredentials");
  }
  if (m.includes("password") && m.includes("least")) {
    return t("join.passwordError");
  }
  if (
    m === "auth_not_configured" ||
    m.includes("supabase is not configured")
  ) {
    return t("join.errAuthNotConfigured");
  }
  if (m === "invalid_input" || m === "invalid_email") {
    return t("join.emailError");
  }
  return t("join.errGeneric");
}

export function isSupabasePublicReady() {
  return Boolean(
    publicEnv.supabaseUrl?.trim() && publicEnv.supabaseAnonKey?.trim()
  );
}

export async function enrollWaitlist(opts: {
  email: string;
  name?: string | null;
  userId?: string | null;
  source: string;
  provider?: "email" | "google";
}): Promise<{ position: number | null; error?: string }> {
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: opts.email,
        name: opts.name ?? null,
        provider: opts.provider ?? "email",
        source: opts.source,
        convertedUserId: opts.userId ?? null,
      }),
    });
    const data = (await res.json()) as WaitlistApiResponse;
    if (!res.ok || !data.ok || !data.entry) {
      return { position: null, error: data.error };
    }
    return { position: data.entry.position };
  } catch {
    return { position: null, error: "waitlist_failed" };
  }
}
