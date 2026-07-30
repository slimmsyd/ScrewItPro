"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import AccountPageShell from "@/components/account/AccountPageShell";
import AccountTabsView from "@/components/portal/account/AccountTabsView";
import { useMember } from "@/components/providers/MemberProvider";
import { JOIN_PATH } from "@/lib/site";

/**
 * Account silo — centered Profile / Addresses / Payment tabs.
 * Design: design_handoff_portal Account view. Password 2-step deferred.
 */
export default function AccountPage() {
  const { status, user } = useMember();

  if (status === "loading") {
    return (
      <AccountPageShell>
        <div style={centerWrap}>
          <p
            style={{
              color: "var(--ink-500)",
              fontFamily: "var(--font-body)",
              margin: 0,
            }}
          >
            Loading account…
          </p>
        </div>
      </AccountPageShell>
    );
  }

  if (!user) {
    return (
      <AccountPageShell>
        <div style={centerWrap}>
          <h1 style={h1Style}>Account</h1>
          <p style={bodyStyle}>Sign in to view your profile and preferences.</p>
          <Link href={`${JOIN_PATH}?mode=login`} style={primaryBtnStyle}>
            Sign in
          </Link>
        </div>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell>
      <AccountTabsView user={user} />
    </AccountPageShell>
  );
}

const centerWrap: CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  width: "100%",
  textAlign: "center",
};

const h1Style: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: 30,
  fontWeight: 400,
  letterSpacing: "-0.015em",
  color: "var(--blue-deep)",
};

const bodyStyle: CSSProperties = {
  margin: "8px 0 20px",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  color: "var(--ink-500)",
  lineHeight: 1.5,
};

const primaryBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 48,
  minHeight: 44,
  padding: "0 22px",
  borderRadius: 12,
  background: "var(--blue-deep)",
  color: "#fff",
  fontFamily: "var(--font-body)",
  fontWeight: 700,
  fontSize: 15,
  textDecoration: "none",
  border: "none",
  boxShadow: "0 8px 20px -8px rgba(4, 32, 155, 0.5)",
};
