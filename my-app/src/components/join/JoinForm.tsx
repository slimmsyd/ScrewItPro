"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ASSETS,
  PRIVACY_PATH,
  TERMS_PATH,
  portalHomeFor,
  safeReturnTo,
} from "@/lib/site";
import { signInWithProvider } from "@/lib/auth/oauth";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useMember } from "@/components/providers/MemberProvider";
import { fireWaitlistConfetti } from "@/lib/confetti";
import {
  shareWaitlistInvite,
  waitlistInviteUrl,
} from "@/lib/member";
import {
  EMAIL_RE,
  MIN_PASSWORD,
  mapWaitlistError,
  mapAuthError,
  isSupabasePublicReady,
  enrollWaitlist,
  type Phase,
  type Mode,
} from "./joinHelpers";
import {
  GoogleMark,
  socialBtn,
  fieldStyle,
  passwordInputStyle,
  labelStyle,
  PasswordField,
} from "./joinUi";

export function JoinForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLocale();
  const { status: memberStatus, user: memberUser, refresh: refreshMember } =
    useMember();
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
  const [shareNote, setShareNote] = useState("");
  const confettiFiredRef = useRef(false);
  const memberGateDoneRef = useRef(false);

  // Celebrate once when the success screen appears (all signup / login / OAuth paths).
  useEffect(() => {
    if (phase !== "done") {
      confettiFiredRef.current = false;
      return;
    }
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    void fireWaitlistConfetti();
    void refreshMember();
  }, [phase, refreshMember]);

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "login") setMode("login");
    if (m === "signup") setMode("signup");
  }, [searchParams]);

  // Already on the waitlist with a live session → skip form, show success + share.
  useEffect(() => {
    if (memberGateDoneRef.current) return;
    if (searchParams.get("error")) return;
    if (searchParams.get("joined") === "1") return;
    if (memberStatus === "loading") return;
    if (memberStatus !== "waitlisted" || !memberUser) return;
    memberGateDoneRef.current = true;
    setEmail(memberUser.email);
    if (memberUser.position) setPos(memberUser.position);
    setPhase("done");
  }, [memberStatus, memberUser, searchParams]);

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
      const ref = searchParams.get("ref");
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim() || null,
          ref: ref && ref.length > 0 ? ref : null,
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
      await refreshMember();
      const returnTo = searchParams.get("return_to");
      if (returnTo) {
        router.replace(safeReturnTo(returnTo, portalHomeFor("customer")));
        return;
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
              }}
            >
              <button
                type="button"
                onClick={async () => {
                  const result = await shareWaitlistInvite({
                    title: t("share.title"),
                    text: t("share.text"),
                    url: waitlistInviteUrl(),
                  });
                  if (result === "copied") setShareNote(t("common.linkCopied"));
                  else if (result === "failed")
                    setShareNote(t("common.shareFailed"));
                  else setShareNote("");
                }}
                style={{
                  display: "inline-flex",
                  height: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 22px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background: "var(--blue-deep)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  minWidth: 200,
                }}
              >
                {t("common.shareWithFriend")}
              </button>
              <Link href="/" className="join-back-link">
                {t("common.backToSite")}
              </Link>
              {shareNote ? (
                <p
                  role="status"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    color: "var(--ink-500)",
                  }}
                >
                  {shareNote}
                </p>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

