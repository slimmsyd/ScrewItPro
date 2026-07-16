"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ASSETS, PRIVACY_PATH, TERMS_PATH } from "@/lib/site";
import { signInWithProvider } from "@/lib/auth/oauth";
import { createClient } from "@/lib/supabase/client";
import { publicEnv } from "@/lib/env";
import { useLocale } from "@/components/providers/LocaleProvider";
import { fireWaitlistConfetti } from "@/lib/confetti";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function GoogleMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const socialBtn: React.CSSProperties = {
  width: "100%",
  height: 50,
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--gray-200)",
  background: "var(--white)",
  color: "var(--ink-900)",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
};

const fieldStyle = (hasError: boolean): React.CSSProperties => ({
  width: "100%",
  height: 50,
  borderRadius: "var(--radius-md)",
  border: `1px solid ${hasError ? "var(--status-error)" : "var(--gray-200)"}`,
  padding: "0 14px",
  fontFamily: "var(--font-body)",
  fontSize: 15.5,
  color: "var(--ink-900)",
  outline: "none",
  boxSizing: "border-box",
});

const passwordInputStyle = (hasError: boolean): React.CSSProperties => ({
  ...fieldStyle(hasError),
  paddingRight: 48,
});

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-body)",
  fontSize: 12.5,
  fontWeight: 600,
  color: "var(--ink-700)",
  marginBottom: 8,
  marginTop: 14,
};

function EyeOpenIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.5 10.6a2.75 2.75 0 003.9 3.9M9.4 5.1A10.4 10.4 0 0112 4.75c6 0 9.75 7.25 9.75 7.25a17.7 17.7 0 01-3.2 4.1M6.4 6.5A17.5 17.5 0 002.25 12S6 18.75 12 18.75c1.2 0 2.33-.22 3.38-.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  onEnter,
  placeholder,
  autoComplete,
  hasError,
  visible,
  onToggleVisible,
  showLabel,
  hideLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder: string;
  autoComplete: string;
  hasError: boolean;
  visible: boolean;
  onToggleVisible: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEnter?.();
          }}
          placeholder={placeholder}
          style={passwordInputStyle(hasError)}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            border: "none",
            background: "transparent",
            color: "var(--ink-500)",
            cursor: "pointer",
            borderRadius: "var(--radius-md)",
            padding: 0,
          }}
        >
          {visible ? <EyeOffIcon /> : <EyeOpenIcon />}
        </button>
      </div>
    </>
  );
}

type WaitlistApiResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
  entry?: {
    email: string;
    position: number;
    created: boolean;
  };
};

type Phase = "form" | "loading" | "done";
type Mode = "signup" | "login";

function mapWaitlistError(
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

function mapAuthError(
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

function isSupabasePublicReady() {
  return Boolean(
    publicEnv.supabaseUrl?.trim() && publicEnv.supabaseAnonKey?.trim()
  );
}

async function enrollWaitlist(opts: {
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

function JoinForm() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [phase, setPhase] = useState<Phase>("form");
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [err, setErr] = useState("");
  const [socialBusy, setSocialBusy] = useState(false);
  const [pos, setPos] = useState<number | null>(null);
  const confettiFiredRef = useRef(false);

  // Celebrate once when the success screen appears (all signup / login / OAuth paths).
  useEffect(() => {
    if (phase !== "done") {
      confettiFiredRef.current = false;
      return;
    }
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    void fireWaitlistConfetti();
  }, [phase]);

  useEffect(() => {
    if (searchParams.get("mode") === "login") {
      setMode("login");
    }
  }, [searchParams]);

  useEffect(() => {
    const authErr = searchParams.get("error");
    if (authErr) {
      const map: Record<string, string> = {
        google_not_configured: t("join.errGoogleNotConfigured"),
        missing_code: t("join.errMissingCode"),
        invalid_state: t("join.errInvalidState"),
        auth_failed: t("join.errAuthFailed"),
        access_denied: t("join.errAccessDenied"),
        waitlist_not_configured: t("join.errWaitlistNotConfigured"),
        waitlist_table_missing: t("join.errWaitlistTableMissing"),
        waitlist_failed: t("join.errWaitlistFailed"),
      };
      setErr(map[authErr] ?? t("join.errGeneric"));
      return;
    }

    if (searchParams.get("joined") !== "1") return;

    // Google OAuth callback success → waitlist success UI
    setPhase("loading");
    (async () => {
      try {
        const r = await fetch("/api/auth/session");
        const data = (await r.json()) as {
          user?: { email?: string; position?: number | null } | null;
        };
        setEmail(data.user?.email || "Google");
        if (
          typeof data.user?.position === "number" &&
          data.user.position > 0
        ) {
          setPos(data.user.position);
        }
        setPhase("done");
      } catch {
        setEmail("Google");
        setPhase("done");
      }
    })();
  }, [searchParams, t]);

  const validate = (forLogin: boolean) => {
    const v = email.trim();
    if (!EMAIL_RE.test(v)) {
      setErr(t("join.emailError"));
      return false;
    }
    if (password.length < MIN_PASSWORD) {
      setErr(t("join.passwordError"));
      return false;
    }
    if (!forLogin) {
      if (password !== passwordConfirm) {
        setErr(t("join.passwordMismatch"));
        return false;
      }
      if (!isSupabasePublicReady()) {
        setErr(t("join.errAuthNotConfigured"));
        return false;
      }
    }
    return true;
  };

  const submitSignup = async () => {
    if (!validate(false)) return;
    setErr("");
    setPhase("loading");

    try {
      // Server creates Auth user already confirmed (no Supabase confirm email)
      // + waitlist row. Custom welcome email can be added later.
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || null,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        userId?: string;
        waitlist?: { email: string; position: number } | null;
        warning?: string;
      };

      if (!res.ok || !data.ok) {
        setPhase("form");
        setErr(mapAuthError(data.error ?? "signup_failed", t));
        return;
      }

      // Establish browser session (optional but keeps them signed in)
      if (isSupabasePublicReady()) {
        try {
          const supabase = createClient();
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
        } catch {
          /* account + waitlist already created */
        }
      }

      if (data.waitlist?.position) {
        setPos(data.waitlist.position);
      } else if (data.warning) {
        // Soft: account ok but waitlist had a config issue
        console.warn("[join] waitlist warning", data.warning);
      }

      setPhase("done");
    } catch (e) {
      setPhase("form");
      setErr(
        e instanceof Error ? mapAuthError(e.message, t) : t("join.errGeneric")
      );
    }
  };

  const submitLogin = async () => {
    if (!validate(true)) return;
    if (!isSupabasePublicReady()) {
      setErr(t("join.errAuthNotConfigured"));
      return;
    }
    setErr("");
    setPhase("loading");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setPhase("form");
        setErr(mapAuthError(error.message, t));
        return;
      }

      const user = data.user;
      const wl = await enrollWaitlist({
        email: user.email ?? email.trim(),
        name:
          (user.user_metadata?.full_name as string | undefined) ??
          (name.trim() || null),
        userId: user.id,
        source: "join_login",
        provider: "email",
      });

      if (user.email) setEmail(user.email);
      if (typeof wl.position === "number" && wl.position > 0) {
        setPos(wl.position);
      }
      setPhase("done");
    } catch (e) {
      setPhase("form");
      setErr(
        e instanceof Error ? mapAuthError(e.message, t) : t("join.errGeneric")
      );
    }
  };

  const socialGoogle = async () => {
    setErr("");
    setSocialBusy(true);
    try {
      await signInWithProvider("google");
    } catch (e) {
      setSocialBusy(false);
      setErr(e instanceof Error ? e.message : t("join.errGeneric"));
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setErr("");
    setPassword("");
    setPasswordConfirm("");
    setShowPassword(false);
    setShowPasswordConfirm(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--white)" }}>
      <header
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <Image src={ASSETS.logoS} alt="" width={40} height={40} />
          <Image
            src={ASSETS.logoWordmark}
            alt="ScrewIt Pros"
            width={140}
            height={36}
            style={{ height: 36, width: "auto" }}
          />
        </Link>
        {phase === "form" && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--ink-500)",
            }}
          >
            {mode === "signup" ? (
              <>
                {t("common.alreadyMember")}{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--blue-deep)",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {t("common.signIn")}
                </button>
              </>
            ) : (
              <>
                {t("join.needAccount")}{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "var(--blue-deep)",
                    fontWeight: 600,
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {t("join.createAccount")}
                </button>
              </>
            )}
          </span>
        )}
      </header>

      <main
        style={{
          maxWidth: 348,
          margin: "0 auto",
          padding: "clamp(40px, 8vh, 88px) 20px 64px",
        }}
      >
        {phase === "form" && (
          <>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12.5,
                fontWeight: 600,
                letterSpacing: "var(--tracking-caps)",
                textTransform: "uppercase",
                color: "var(--blue-electric)",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--blue-electric)",
                  boxShadow: "0 0 0 4px rgba(29,110,254,0.2)",
                }}
              />
              {t("join.beta")}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                fontWeight: 400,
                color: "var(--blue-deep)",
                margin: "0 0 10px",
                letterSpacing: "var(--tracking-display)",
              }}
            >
              {mode === "signup" ? t("join.title") : t("join.loginTitle")}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-muted)",
                margin: "0 0 20px",
                lineHeight: 1.55,
              }}
            >
              {mode === "signup" ? t("join.sub") : t("join.loginSub")}
            </p>

            {mode === "signup" && (
              <>
                <label style={{ ...labelStyle, marginTop: 0 }}>
                  {t("join.name")}
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("join.namePlaceholder")}
                  style={fieldStyle(false)}
                />
              </>
            )}

            <label style={{ ...labelStyle, marginTop: mode === "signup" ? 14 : 0 }}>
              {t("join.email")}
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr("");
              }}
              placeholder={t("join.emailPlaceholder")}
              style={fieldStyle(Boolean(err))}
            />

            <PasswordField
              id="join-password"
              label={t("join.password")}
              value={password}
              onChange={(v) => {
                setPassword(v);
                setErr("");
              }}
              onEnter={() => {
                if (mode === "login") {
                  void submitLogin();
                } else if (passwordConfirm) {
                  void submitSignup();
                }
              }}
              placeholder={t("join.passwordPlaceholder")}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              hasError={Boolean(err)}
              visible={showPassword}
              onToggleVisible={() => setShowPassword((v) => !v)}
              showLabel={t("join.showPassword")}
              hideLabel={t("join.hidePassword")}
            />

            {mode === "signup" && (
              <PasswordField
                id="join-password-confirm"
                label={t("join.passwordConfirm")}
                value={passwordConfirm}
                onChange={(v) => {
                  setPasswordConfirm(v);
                  setErr("");
                }}
                onEnter={() => void submitSignup()}
                placeholder={t("join.passwordConfirmPlaceholder")}
                autoComplete="new-password"
                hasError={Boolean(err)}
                visible={showPasswordConfirm}
                onToggleVisible={() => setShowPasswordConfirm((v) => !v)}
                showLabel={t("join.showPassword")}
                hideLabel={t("join.hidePassword")}
              />
            )}

            {err && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 12.5,
                  color: "var(--status-error-text)",
                  fontFamily: "var(--font-body)",
                }}
              >
                {err}
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                void (mode === "signup" ? submitSignup() : submitLogin())
              }
              style={{
                width: "100%",
                height: 50,
                marginTop: 16,
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--blue-deep)",
                color: "var(--white)",
                fontFamily: "var(--font-body)",
                fontSize: 15.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {mode === "signup" ? t("join.joinNow") : t("common.signIn")}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "16px 0",
                color: "var(--ink-300)",
                fontSize: 12,
                fontFamily: "var(--font-body)",
              }}
            >
              <span
                style={{ flex: 1, height: 1, background: "var(--gray-200)" }}
              />
              {t("common.or")}
              <span
                style={{ flex: 1, height: 1, background: "var(--gray-200)" }}
              />
            </div>

            <button
              type="button"
              disabled={socialBusy}
              onClick={() => void socialGoogle()}
              style={socialBtn}
            >
              <GoogleMark />
              {socialBusy
                ? t("join.connectingGoogle")
                : t("join.continueGoogle")}
            </button>

            <p
              style={{
                marginTop: 20,
                fontSize: 11.5,
                color: "var(--ink-300)",
                fontFamily: "var(--font-body)",
                lineHeight: 1.5,
              }}
            >
              {t("join.fineprint")}{" "}
              <Link
                href={TERMS_PATH}
                style={{
                  color: "var(--blue-electric)",
                  textDecoration: "underline",
                }}
              >
                {t("join.fineprintTerms")}
              </Link>
              {" · "}
              <Link
                href={PRIVACY_PATH}
                style={{
                  color: "var(--blue-electric)",
                  textDecoration: "underline",
                }}
              >
                {t("join.fineprintPrivacy")}
              </Link>
            </p>
          </>
        )}

        {phase === "loading" && (
          <div
            style={{
              textAlign: "center",
              paddingTop: 48,
              fontFamily: "var(--font-body)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              {[
                "var(--blue-deep)",
                "var(--blue-electric)",
                "var(--blue-steel)",
              ].map((c, i) => (
                <span
                  key={c}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: c,
                    display: "inline-block",
                    animation: `bounce 1.1s ease-in-out ${i * 0.18}s infinite`,
                  }}
                />
              ))}
            </div>
            <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}`}</style>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "var(--tracking-caps)",
                textTransform: "uppercase",
                color: "var(--ink-300)",
              }}
            >
              {t("join.saving")}
            </div>
          </div>
        )}

        {phase === "done" && (
          <div style={{ textAlign: "center", paddingTop: 24 }}>
            <div
              style={{
                width: 62,
                height: 62,
                borderRadius: "50%",
                background: "var(--blue-50)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "var(--blue-electric)",
                fontSize: 28,
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12.5,
                fontWeight: 600,
                letterSpacing: "var(--tracking-caps)",
                textTransform: "uppercase",
                color: "var(--blue-electric)",
                marginBottom: 12,
              }}
            >
              {t("join.youreIn")}
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                color: "var(--blue-deep)",
                margin: "0 0 12px",
              }}
            >
              {t("join.successTitle")}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-muted)",
                lineHeight: 1.55,
                margin: "0 0 24px",
              }}
            >
              {t("join.successBody", { email })}
            </p>
            {pos != null && pos > 0 && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 8,
                  padding: "12px 20px",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--gray-50)",
                  border: "1px solid var(--gray-100)",
                  marginBottom: 28,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 28,
                    color: "var(--blue-deep)",
                  }}
                >
                  #{pos}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "var(--ink-500)",
                  }}
                >
                  {t("join.inLine")}
                </span>
              </div>
            )}
            <div>
              <Link href="/" className="join-back-link">
                {t("common.backToSite")}
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function JoinPage() {
  const { t } = useLocale();
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-body)",
            color: "var(--ink-500)",
          }}
        >
          {t("common.loading")}
        </div>
      }
    >
      <JoinForm />
    </Suspense>
  );
}
