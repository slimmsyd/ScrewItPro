"use client";

import Link from "next/link";
import { useEffect, type CSSProperties, type ReactNode } from "react";
import AccountPageShell from "@/components/account/AccountPageShell";
import { useMember } from "@/components/providers/MemberProvider";
import { memberInitials } from "@/components/quote/QuoteAccountMenu";
import { JOIN_PATH } from "@/lib/site";

/**
 * Account profile shell — credentials from session; addresses / payment /
 * notifications are section anchors for the expanded menu (silo pages later).
 */
export default function AccountPage() {
  const { status, user, signOut } = useMember();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (status === "loading") {
    return (
      <AccountPageShell>
        <main style={mainStyle}>
          <p style={{ color: "var(--ink-500)", fontFamily: "var(--font-body)" }}>
            Loading account…
          </p>
        </main>
      </AccountPageShell>
    );
  }

  if (!user) {
    return (
      <AccountPageShell>
        <main style={mainStyle}>
          <h1 style={h1Style}>Account</h1>
          <p style={bodyStyle}>Sign in to view your profile and preferences.</p>
          <Link href={`${JOIN_PATH}?mode=login`} style={primaryBtnStyle}>
            Sign in
          </Link>
        </main>
      </AccountPageShell>
    );
  }

  const initials = memberInitials(user);
  const displayName = user.name?.trim() || "Your name";
  const providerLabel =
    user.provider === "google"
      ? "Google"
      : user.provider === "email"
        ? "Email"
        : user.provider || "Account";

  return (
    <AccountPageShell>
      <main style={mainStyle} className="screen-anim">
        <h1 style={h1Style}>Account</h1>
        <p style={{ ...bodyStyle, marginBottom: 28 }}>
          Your credentials and preferences. Addresses, payment, and notifications
          will deepen as booking and Stripe go live.
        </p>

        {/* Profile */}
        <section id="profile" style={cardStyle}>
          <SectionLabel>Profile</SectionLabel>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt=""
                width={56}
                height={56}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <span
                aria-hidden
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, var(--blue-electric), var(--blue-deep))",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 18,
                  fontFamily: "var(--font-body)",
                }}
              >
                {initials}
              </span>
            )}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--blue-deep)",
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--ink-500)",
                  marginTop: 2,
                }}
              >
                {user.email}
              </div>
            </div>
          </div>
          <FactRow label="Email" value={user.email} />
          <FactRow label="Name" value={user.name?.trim() || "Not set"} />
          <FactRow label="Signed in with" value={providerLabel} />
        </section>

        <section id="addresses" style={cardStyle}>
          <SectionLabel>Addresses</SectionLabel>
          <EmptyHint>
            Saved delivery addresses will show here after you book. Your quote
            journey still captures addresses per job.
          </EmptyHint>
        </section>

        <section id="payment" style={cardStyle}>
          <SectionLabel>Payment</SectionLabel>
          <EmptyHint>
            Cards and receipts appear when deposit checkout (Stripe) is wired.
            No payment method is stored yet.
          </EmptyHint>
        </section>

        <section id="notifications" style={cardStyle}>
          <SectionLabel>Notifications</SectionLabel>
          <EmptyHint>
            Status emails are the V1 channel. In-app notification prefs will land
            with the full jobs backend.
          </EmptyHint>
        </section>

        <button
          type="button"
          onClick={() => void signOut()}
          style={{
            ...primaryBtnStyle,
            background: "#fff",
            color: "var(--blue-deep)",
            border: "1.5px solid var(--border-default)",
            boxShadow: "none",
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          Sign out
        </button>
      </main>
    </AccountPageShell>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--ink-300)",
        marginBottom: 14,
      }}
    >
      {children}
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        padding: "10px 0",
        borderTop: "1px solid var(--gray-100)",
        fontFamily: "var(--font-body)",
        fontSize: 14,
      }}
    >
      <span style={{ color: "var(--ink-500)" }}>{label}</span>
      <span
        style={{
          color: "var(--blue-deep)",
          fontWeight: 600,
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: "var(--font-body)",
        fontSize: 14,
        lineHeight: 1.5,
        color: "var(--ink-500)",
      }}
    >
      {children}
    </p>
  );
}

const mainStyle: CSSProperties = {
  flex: 1,
  padding: "32px 24px 56px",
  maxWidth: 560,
  margin: "0 auto",
  width: "100%",
  boxSizing: "border-box",
};

const h1Style: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: 30,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "var(--blue-deep)",
};

const bodyStyle: CSSProperties = {
  margin: "8px 0 0",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  color: "var(--ink-500)",
  lineHeight: 1.5,
};

const cardStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid var(--border-default)",
  borderRadius: 16,
  padding: "18px 18px 16px",
  marginBottom: 14,
  boxShadow: "0 8px 24px -18px rgba(4, 32, 155, 0.14)",
};

const primaryBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 48,
  padding: "0 22px",
  borderRadius: 12,
  background: "var(--blue-deep)",
  color: "#fff",
  fontFamily: "var(--font-body)",
  fontWeight: 700,
  fontSize: 15,
  textDecoration: "none",
  border: "none",
};
