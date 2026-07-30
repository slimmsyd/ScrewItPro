"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import QuoteAccountMenu, {
  QuoteAccountMenuSkeleton,
} from "@/components/quote/QuoteAccountMenu";
import { useMember } from "@/components/providers/MemberProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ASSETS, JOIN_PATH, QUOTE_PATH } from "@/lib/site";

/**
 * Full-page post-book confirmation chrome only.
 * Logo + quote CTA + account — no marketing nav (church stays off).
 */
export default function ConfirmationShell({
  children,
  ctaLabel = "Get another quote",
}: {
  children: ReactNode;
  ctaLabel?: string;
}) {
  const mobile = useIsMobile();
  const { t } = useLocale();
  const { status, user, signOut } = useMember();
  const sessionLoading = status === "loading";
  const signedIn =
    (status === "signed_in" || status === "waitlisted") && user != null;

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        fontFamily: "var(--font-body)",
      }}
    >
      <header
        style={{
          height: 64,
          flex: "0 0 64px",
          display: "flex",
          alignItems: "center",
          padding: mobile ? "0 16px" : "0 34px",
          borderBottom: "1px solid var(--border-default)",
          background: "#fff",
          gap: 12,
          zIndex: 30,
        }}
      >
        <Link
          href="/jobs"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            textDecoration: "none",
            flex: "0 0 auto",
          }}
        >
          <Image
            src={ASSETS.logoElectric}
            alt="ScrewIt Pros"
            width={26}
            height={26}
            style={{ borderRadius: 6, objectFit: "cover" }}
          />
          {!mobile && (
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: "var(--blue-deep)",
              }}
            >
              ScrewIt <span style={{ color: "var(--blue-steel)" }}>Pros</span>
            </span>
          )}
        </Link>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: mobile ? 10 : 12,
            flex: "0 0 auto",
          }}
        >
          <Link
            href={QUOTE_PATH}
            style={{
              height: 36,
              padding: "0 16px",
              borderRadius: 999,
              border: "1.5px solid var(--border-default)",
              background: "#fff",
              color: "var(--blue-deep)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            {ctaLabel}
          </Link>

          {sessionLoading ? (
            <QuoteAccountMenuSkeleton />
          ) : signedIn && user ? (
            <QuoteAccountMenu user={user} onSignOut={() => void signOut()} />
          ) : (
            <Link
              href={`${JOIN_PATH}?mode=login`}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--ink-700)",
                textDecoration: "none",
              }}
            >
              {t("common.signIn")}
            </Link>
          )}
        </div>
      </header>

      <div
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}
