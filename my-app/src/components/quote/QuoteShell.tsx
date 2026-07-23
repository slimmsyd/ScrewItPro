"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import QuoteStepper, {
  type QuoteStepIndex,
} from "@/components/quote/QuoteStepper";
import QuoteAccountMenu, {
  QuoteAccountMenuSkeleton,
} from "@/components/quote/QuoteAccountMenu";
import { useMember } from "@/components/providers/MemberProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ASSETS, JOIN_PATH } from "@/lib/site";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function QuoteShell({
  step,
  children,
  aside,
  mobileBar,
  asideWidth = 340,
  mainBackground = "#fff",
}: {
  step: QuoteStepIndex;
  children: ReactNode;
  aside?: ReactNode;
  /** Sticky mobile CTA strip */
  mobileBar?: ReactNode;
  /** Right rail width; payment aside uses 360 per handoff */
  asideWidth?: number;
  /** Main column canvas (Price uses gray-50 full-bleed per handoff) */
  mainBackground?: string;
}) {
  const router = useRouter();
  const mobile = useIsMobile();
  const { t } = useLocale();
  // Same session source as homepage TopUtilityBar — do not invent parallel auth.
  const { status, user, signOut } = useMember();
  const sessionLoading = status === "loading";
  const signedIn =
    (status === "signed_in" || status === "waitlisted") && user != null;
  // During session fetch, use outline Save so we never flash solid+Sign in for logged-in users.
  const saveExitOutline = signedIn || sessionLoading;

  const saveExitButton = (
    <button
      type="button"
      onClick={() => router.push("/")}
      style={
        saveExitOutline
          ? {
              height: 36,
              padding: "0 16px",
              borderRadius: 999,
              border: "1.5px solid var(--border-default)",
              background: "#fff",
              color: "var(--blue-deep)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }
          : {
              height: 36,
              padding: "0 14px",
              borderRadius: 999,
              border: "none",
              background: "var(--blue-electric)",
              color: "#fff",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }
      }
    >
      Save & exit
    </button>
  );

  return (
    <div
      className="quote-shell"
      style={{
        /* Fixed viewport height so the right rail does not grow with main content */
        height: "100dvh",
        minHeight: "100dvh",
        maxHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        fontFamily: "var(--font-body)",
        overflow: "hidden",
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
          href="/"
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
              ScrewIt{" "}
              <span style={{ color: "var(--blue-steel)" }}>Pros</span>
            </span>
          )}
        </Link>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            marginLeft: mobile ? 8 : 34,
            maxWidth: 520,
          }}
        >
          <QuoteStepper step={step} allowJumpTo={step} />
        </div>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: mobile ? 10 : 12,
            flex: "0 0 auto",
          }}
        >
          {sessionLoading ? (
            <>
              {/* Loading chrome: same footprint as signed-in header — no "Sign in" flash */}
              {saveExitButton}
              <QuoteAccountMenuSkeleton />
            </>
          ) : signedIn && user ? (
            <>
              {/* Mock order: outline Save & exit, then avatar chip */}
              {saveExitButton}
              <QuoteAccountMenu
                user={user}
                onSignOut={() => void signOut()}
              />
            </>
          ) : (
            <>
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
              {saveExitButton}
            </>
          )}
        </div>
      </header>

      <div
        style={{
          flex: "1 1 auto",
          display: "flex",
          minHeight: 0,
          height: "100%",
          overflow: "hidden",
          flexDirection: mobile ? "column" : "row",
        }}
      >
        <main
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: mobile ? "24px 16px 120px" : "34px 40px",
            WebkitOverflowScrolling: "touch",
            background: mainBackground,
          }}
        >
          {children}
        </main>
        {!mobile && aside ? (
          <div
            className="quote-aside-slot"
            style={{
              flex: `0 0 ${asideWidth}px`,
              width: asideWidth,
              maxWidth: asideWidth,
              height: "100%",
              maxHeight: "100%",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
              alignSelf: "stretch",
            }}
          >
            {aside}
          </div>
        ) : null}
      </div>

      {mobile && mobileBar && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            background: "#fff",
            borderTop: "1px solid var(--border-default)",
            padding: "12px 16px calc(12px + env(safe-area-inset-bottom))",
            boxShadow: "0 -8px 24px rgba(4,32,155,0.08)",
          }}
        >
          {mobileBar}
        </div>
      )}
    </div>
  );
}
