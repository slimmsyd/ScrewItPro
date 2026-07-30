"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import AccountPageShell from "@/components/account/AccountPageShell";
import ReferralsView from "@/components/portal/ReferralsView";
import { useMember } from "@/components/providers/MemberProvider";
import { JOIN_PATH } from "@/lib/site";

/** Signed-in gate for the Refer & Earn silo — mirrors Account. */
export default function ReferralsPageClient() {
  const { status, user } = useMember();

  if (status === "loading") {
    return (
      <AccountPageShell>
        <div style={centerWrap}>
          <p style={bodyStyle}>Loading referrals…</p>
        </div>
      </AccountPageShell>
    );
  }

  if (!user) {
    return (
      <AccountPageShell>
        <div style={centerWrap}>
          <h1 style={h1Style}>Refer &amp; Earn</h1>
          <p style={bodyStyle}>
            Sign in to get your referral link and track your credits.
          </p>
          <Link href={`${JOIN_PATH}?mode=login`} style={primaryBtnStyle}>
            Sign in
          </Link>
        </div>
      </AccountPageShell>
    );
  }

  return (
    <AccountPageShell>
      <ReferralsView />
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
  letterSpacing: "-0.01em",
  textDecoration: "none",
};
