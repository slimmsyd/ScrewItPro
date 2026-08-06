"use client";

import { useEffect, useState } from "react";
import { Check, KeyRound, Mail, MailCheck, ShieldX, TriangleAlert } from "lucide-react";
import { ADMIN_SIGNIN_PATH } from "@/lib/site";

/**
 * Admin sign-in - invite-only gate. Adapted from the signin-export UI kit.
 *
 * Three deliberate departures from the kit:
 *  1. The kit decided access in the browser (a ROSTER array + a localStorage
 *     session). Access is resolved server-side by requireAdmin() and the
 *     session is a Supabase auth cookie. `state` below is already-resolved
 *     truth, not something this component computes.
 *  2. The kit's account "chooser" is Google's real screen in this flow.
 *  3. The kit's roster panel listed real-looking people. Inventing teammate
 *     names on a live screen is the fixture-PII pattern the vault forbids, so
 *     the panel states the policy instead of naming anyone.
 */

export type AdminSignInState =
  | "idle"
  | "denied"
  | "invited"
  | "in"
  | "not_configured";

/** Muted text is ink-500, never ink-300 (#9AA1BC fails 4.5:1 on white). */
const MUTED = "var(--ink-500)";
/** ink-300 is for decorative glyphs and rules only. */
const FAINT = "var(--ink-300)";

/** Kit cards sit on --gray-50, which globals.css forces to #fff under 768px  - 
 *  the card would dissolve into the page. Pin the wash explicitly. */
const PAGE_WASH = "#F4F6FB";

const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: "28px 30px",
  width: "100%",
  maxWidth: 412,
  boxShadow: "0 24px 60px -28px rgba(4, 20, 90, 0.4)",
};

const headingStyle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 400,
  color: "var(--blue-deep)",
  letterSpacing: "-0.015em",
  lineHeight: 1.15,
};

function GoogleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden style={{ display: "block", flex: "0 0 auto" }}>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.9 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-2.8-.4-4.1H24v8.3h12.7c-.3 2.1-1.6 5.2-4.7 7.3l7.6 5.9c4.5-4.2 6.9-10.3 6.9-17.4z" />
      <path fill="#FBBC05" d="M10.4 28.2a14.6 14.6 0 0 1 0-8.4l-7.8-6.1a24 24 0 0 0 0 20.6l7.8-6.1z" />
      <path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.6-5.6l-7.6-5.9c-2 1.4-4.8 2.4-8 2.4-6.3 0-11.7-4.4-13.6-10.2l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5z" />
    </svg>
  );
}

/** Status glyph tile - success / warning / error surfaces from the token set. */
function StatusTile({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "err";
  children: React.ReactNode;
}) {
  const bg =
    tone === "ok"
      ? "var(--status-success-bg)"
      : tone === "warn"
        ? "var(--status-warning-bg)"
        : "var(--status-error-bg)";
  return (
    <span style={{ width: 38, height: 38, borderRadius: 11, background: bg, display: "grid", placeItems: "center" }}>
      {children}
    </span>
  );
}

export default function AdminSignIn({
  state,
  email,
  returnTo,
}: {
  state: AdminSignInState;
  /** Signed-in address, when there is one - shown so a refusal is unambiguous. */
  email?: string | null;
  /** Safe path to land on after Google. */
  returnTo?: string;
}) {
  const [busy, setBusy] = useState(false);

  // Success is a beat, not a destination: the server already verified access,
  // so hold the confirmation briefly and move on.
  useEffect(() => {
    if (state !== "in") return;
    const t = setTimeout(() => {
      window.location.href = returnTo ?? "/admin/settings";
    }, 900);
    return () => clearTimeout(t);
  }, [state, returnTo]);

  const startGoogle = () => {
    setBusy(true);
    const back = returnTo ?? `${ADMIN_SIGNIN_PATH}?welcome=1`;
    window.location.href = `/auth/google?return_to=${encodeURIComponent(back)}`;
  };

  return (
    <div style={{ display: "flex", minHeight: "100dvh", width: "100%", flexWrap: "wrap" }}>
      {/* Brand side. Collapses to a banner on narrow screens rather than
          stealing half the viewport from the actual task. */}
      <div
        style={{
          flex: "1 1 380px",
          minWidth: 0,
          background: "var(--blue-deep)",
          padding: "44px 46px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11, position: "relative", zIndex: 2 }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "#fff",
              color: "var(--blue-deep)",
              fontFamily: "var(--font-display)",
              fontSize: 19,
              display: "grid",
              placeItems: "center",
            }}
            aria-hidden
          >
            S
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>
            ScrewIt Pros
            <em
              style={{
                display: "block",
                fontStyle: "normal",
                fontSize: 10.5,
                fontWeight: 600,
                color: "#8FB4FF",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              Admin
            </em>
          </span>
        </div>

        <div style={{ marginTop: "auto", paddingTop: 48, position: "relative", zIndex: 2 }}>
          <h1 style={{ ...headingStyle, fontSize: "clamp(28px, 4vw, 40px)", color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Run the shop from one place.
          </h1>
          <p style={{ fontSize: 14, color: "#A8BEFF", marginTop: 14, lineHeight: 1.6, maxWidth: 400 }}>
            Orders, today&rsquo;s board, the week&rsquo;s schedule, your crew, and the money &mdash; for the people who actually run ScrewIt Pros.
          </p>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 17, color: "#fff", marginTop: 26, opacity: 0.9 }}>
            If You Don&rsquo;t Want to Do It, ScrewIt!
          </p>
        </div>

        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -120,
            bottom: -140,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle at 30% 30%, rgba(29,110,254,.55), transparent 62%)",
          }}
        />
      </div>

      {/* Sign-in side */}
      <div
        style={{
          flex: "1 1 460px",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: PAGE_WASH,
        }}
      >
        <div style={{ width: "100%", maxWidth: 412, display: "flex", flexDirection: "column", gap: 14 }}>
          {state === "idle" && (
            <div style={cardStyle}>
              <h2 style={{ ...headingStyle, fontSize: 26 }}>Sign in</h2>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 7, lineHeight: 1.55 }}>
                Use the Google account tied to your ScrewIt Pros address.
              </p>

              <button
                type="button"
                onClick={startGoogle}
                disabled={busy}
                className="sip-admin-focus"
                style={{
                  width: "100%",
                  minHeight: 48,
                  marginTop: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 11,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border-strong)",
                  background: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: busy ? MUTED : "var(--ink-900)",
                  cursor: busy ? "progress" : "pointer",
                  transition: "border-color 180ms ease, box-shadow 180ms ease",
                }}
              >
                {busy ? <Spinner size={17} /> : <GoogleMark />}
                {busy ? "Opening Google…" : "Continue with Google"}
              </button>

              <div
                style={{
                  borderTop: "1px solid var(--gray-100)",
                  marginTop: 20,
                  paddingTop: 16,
                  display: "flex",
                  gap: 9,
                  fontSize: 12,
                  color: MUTED,
                  lineHeight: 1.55,
                }}
              >
                <KeyRound size={14} color={FAINT} style={{ marginTop: 1, flex: "0 0 auto" }} aria-hidden />
                <span>
                  There is no sign-up. Accounts are created by the owner &mdash; if you need access, ask the owner to add you.
                </span>
              </div>
            </div>
          )}

          {state === "denied" && (
            <div style={cardStyle}>
              <StatusTile tone="err">
                <ShieldX size={19} color="var(--status-error)" aria-hidden />
              </StatusTile>
              <h2 style={{ ...headingStyle, fontSize: 23, marginTop: 14 }}>This account isn&rsquo;t on the list</h2>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>
                {email ? <b style={{ color: "var(--ink-900)" }}>{email}</b> : "That account"} has no access to ScrewIt Pros
                Admin, and signing in doesn&rsquo;t create it.
              </p>
              <div
                style={{
                  background: PAGE_WASH,
                  borderRadius: 10,
                  padding: "12px 13px",
                  marginTop: 16,
                  display: "flex",
                  gap: 9,
                  fontSize: 12,
                  color: MUTED,
                  lineHeight: 1.55,
                }}
              >
                <Mail size={14} color={FAINT} style={{ marginTop: 1, flex: "0 0 auto" }} aria-hidden />
                <span>Ask the owner to grant access. Nothing was shared with this account.</span>
              </div>
              <SignOutButton>Use another account</SignOutButton>
            </div>
          )}

          {state === "invited" && (
            <div style={cardStyle}>
              <StatusTile tone="warn">
                <MailCheck size={19} color="var(--status-warning)" aria-hidden />
              </StatusTile>
              <h2 style={{ ...headingStyle, fontSize: 23, marginTop: 14 }}>Your invite is waiting</h2>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>
                {email ? <b style={{ color: "var(--ink-900)" }}>{email}</b> : "This account"} has been added as an admin, but
                the invite hasn&rsquo;t been accepted yet. Open the email and follow the link once &mdash; after that this
                page lets you straight through.
              </p>
              <SignOutButton>Use another account</SignOutButton>
            </div>
          )}

          {state === "in" && (
            <div style={{ ...cardStyle, textAlign: "center", padding: "38px 30px" }} role="status">
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 99,
                  background: "var(--status-success-bg)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto",
                }}
              >
                <Check size={20} color="var(--status-success)" strokeWidth={3} aria-hidden />
              </span>
              <b style={{ ...headingStyle, display: "block", fontSize: 22, marginTop: 14 }}>Welcome back</b>
              <span style={{ display: "block", fontSize: 12.5, color: MUTED, marginTop: 6 }}>Opening the dashboard&hellip;</span>
            </div>
          )}

          {state === "not_configured" && (
            <div style={cardStyle}>
              <StatusTile tone="warn">
                <TriangleAlert size={19} color="var(--status-warning)" aria-hidden />
              </StatusTile>
              <h2 style={{ ...headingStyle, fontSize: 23, marginTop: 14 }}>Admin isn&rsquo;t configured</h2>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 8, lineHeight: 1.6 }}>
                Sign-in can&rsquo;t run because Supabase credentials are missing in this environment. This is a setup
                problem, not a permissions one &mdash; no access decision was made.
              </p>
            </div>
          )}

          {/* The policy, stated. No names: this screen has no roster to read
              from, and inventing teammates would be fixture PII on a live page. */}
          {(state === "idle" || state === "denied") && (
            <div style={{ background: "#fff", borderRadius: 14, padding: "15px 17px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <KeyRound size={13} color="var(--blue-electric)" aria-hidden />
                <b
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    color: "var(--ink-900)",
                  }}
                >
                  Who has access
                </b>
              </div>
              {/* `margin: 0` must precede marginTop - later keys win in a style
                  object, and reversing these silently collapses the gap. */}
              <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 10, marginTop: 13 }}>
                <RoleRow name="Super admin" detail="Platform engineering. Granted outside the database." />
                <RoleRow name="Admin" detail="The owner. Everything in the admin app." />
              </dl>
              <p
                style={{
                  borderTop: "1px solid var(--gray-100)",
                  marginTop: 14,
                  paddingTop: 13,
                  fontSize: 11.5,
                  color: MUTED,
                  lineHeight: 1.55,
                }}
              >
                Access is invite-only and granted by the owner. Roles are enforced on the server on every request &mdash;
                this screen only reports the answer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleRow({ name, detail }: { name: string; detail: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <dt style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-900)", flex: "0 0 88px" }}>{name}</dt>
      <dd style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5, margin: 0 }}>{detail}</dd>
    </div>
  );
}

/**
 * Sign out, then return to this page in its signed-out state.
 *
 * Client-side rather than a GET /auth/signout route: a link that mutates
 * session state can be triggered cross-site, and the app has no signout
 * endpoint today - sign-out elsewhere goes through the same browser client.
 */
function SignOutButton({ children }: { children: React.ReactNode }) {
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
    } catch {
      /* already signed out or unconfigured - the reload still lands correctly */
    }
    window.location.href = ADMIN_SIGNIN_PATH;
  };

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={busy}
      className="sip-admin-focus"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        width: "100%",
        minHeight: 44,
        marginTop: 18,
        borderRadius: 10,
        border: "1px solid var(--border-default)",
        background: "#fff",
        fontFamily: "var(--font-body)",
        fontSize: 13.5,
        fontWeight: 600,
        color: "var(--ink-700)",
        cursor: busy ? "progress" : "pointer",
      }}
    >
      {busy && <Spinner size={15} />}
      {busy ? "Signing out…" : children}
    </button>
  );
}

/** Reuses the shared screwitSpin keyframe; stilled under reduced motion. */
function Spinner({ size = 34 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="sip-admin-spinner"
      style={{
        width: size,
        height: size,
        borderRadius: 99,
        border: `${Math.max(2, Math.round(size / 11))}px solid var(--gray-100)`,
        borderTopColor: "var(--blue-electric)",
        flex: "0 0 auto",
        display: "block",
      }}
    />
  );
}
