"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ASSETS, PRIVACY_PATH, TERMS_PATH } from "@/lib/site";
import { signInWithProvider } from "@/lib/auth/oauth";
import { useLocale } from "@/components/providers/LocaleProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function AppleMark() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 12.54c-.02-2.05 1.68-3.03 1.75-3.08-.95-1.4-2.44-1.59-2.97-1.61-1.26-.13-2.47.74-3.11.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.65.8-3.36 2.03-1.43 2.49-.37 6.17 1.03 8.19.68.99 1.5 2.1 2.56 2.06 1.03-.04 1.42-.66 2.66-.66 1.24 0 1.59.66 2.68.64 1.11-.02 1.81-1 2.49-1.99.78-1.14 1.11-2.25 1.13-2.31-.02-.01-2.17-.83-2.19-3.3zM15.1 6.36c.56-.68.94-1.63.84-2.58-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.56-.86 2.48.9.07 1.83-.46 2.39-1.12z" />
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

function JoinForm() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [phase, setPhase] = useState<"form" | "loading" | "done">("form");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [socialBusy, setSocialBusy] = useState<"google" | "apple" | null>(
    null
  );
  const [pos, setPos] = useState<number | null>(null);

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

    setPhase("loading");
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then(
        (data: {
          user?: { email?: string; position?: number | null } | null;
        }) => {
          setEmail(data.user?.email || "Google");
          if (
            typeof data.user?.position === "number" &&
            data.user.position > 0
          ) {
            setPos(data.user.position);
          }
          setPhase("done");
        }
      )
      .catch(() => {
        setEmail("Google");
        setPhase("done");
      });
  }, [searchParams, t]);

  const submit = async () => {
    const v = email.trim();
    if (!EMAIL_RE.test(v)) {
      setErr(t("join.emailError"));
      return;
    }
    setErr("");
    setPhase("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: v,
          provider: "email",
          source: "join",
        }),
      });
      const data = (await res.json()) as WaitlistApiResponse;

      if (!res.ok || !data.ok || !data.entry) {
        setPhase("form");
        setErr(mapWaitlistError(data.error, t));
        return;
      }

      setEmail(data.entry.email);
      setPos(data.entry.position);
      setPhase("done");
    } catch {
      setPhase("form");
      setErr(t("join.errWaitlistFailed"));
    }
  };

  const social = async (provider: "google" | "apple") => {
    setErr("");
    setSocialBusy(provider);
    try {
      await signInWithProvider(provider);
    } catch (e) {
      setSocialBusy(null);
      setErr(
        e instanceof Error
          ? e.message
          : provider === "apple"
            ? t("join.appleNotReady")
            : t("join.errGeneric")
      );
    }
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
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--ink-500)",
          }}
        >
          {t("common.alreadyMember")}{" "}
          <Link
            href="/join"
            style={{ color: "var(--blue-deep)", fontWeight: 600 }}
          >
            {t("common.signIn")}
          </Link>
        </span>
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
              {t("join.title")}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--text-muted)",
                margin: "0 0 28px",
                lineHeight: 1.55,
              }}
            >
              {t("join.sub")}
            </p>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-body)",
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--ink-700)",
                marginBottom: 8,
              }}
            >
              {t("join.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={t("join.emailPlaceholder")}
              style={{
                width: "100%",
                height: 50,
                borderRadius: "var(--radius-md)",
                border: `1px solid ${err ? "var(--status-error)" : "var(--gray-200)"}`,
                padding: "0 14px",
                fontFamily: "var(--font-body)",
                fontSize: 15.5,
                color: "var(--ink-900)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
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
              onClick={submit}
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
              {t("join.joinNow")}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                disabled={socialBusy !== null}
                onClick={() => social("google")}
                style={socialBtn}
              >
                <GoogleMark />
                {socialBusy === "google"
                  ? t("join.connectingGoogle")
                  : t("join.continueGoogle")}
              </button>
              <button
                type="button"
                disabled={socialBusy !== null}
                onClick={() => social("apple")}
                style={socialBtn}
              >
                <AppleMark />
                {socialBusy === "apple"
                  ? t("join.connectingApple")
                  : t("join.continueApple")}
              </button>
            </div>

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
                style={{ color: "var(--blue-electric)", textDecoration: "underline" }}
              >
                {t("join.fineprintTerms")}
              </Link>
              {" · "}
              <Link
                href={PRIVACY_PATH}
                style={{ color: "var(--blue-electric)", textDecoration: "underline" }}
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
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  height: 48,
                  alignItems: "center",
                  padding: "0 22px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--gray-200)",
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--blue-deep)",
                  textDecoration: "none",
                }}
              >
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
