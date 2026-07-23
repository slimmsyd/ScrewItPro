"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import MvpBadge from "@/components/home/MvpBadge";
import QuoteAccountMenu, {
  QuoteAccountMenuSkeleton,
} from "@/components/quote/QuoteAccountMenu";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useMember } from "@/components/providers/MemberProvider";
import { JOIN_PATH, QUOTE_PATH } from "@/lib/site";
import { shareWaitlistInvite, waitlistInviteUrl } from "@/lib/member";

function UtilLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const [h, setH] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 13,
        fontWeight: 600,
        color: h ? "var(--blue-deep)" : "var(--ink-500)",
        textDecoration: "none",
        transition: "color 160ms",
      }}
    >
      {children}
    </a>
  );
}

function UtilButton({
  onClick,
  children,
  emphasize,
}: {
  onClick: () => void;
  children: React.ReactNode;
  emphasize?: boolean;
}) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 13,
        fontWeight: 600,
        color: emphasize
          ? h
            ? "var(--blue-electric)"
            : "var(--blue-deep)"
          : h
            ? "var(--blue-deep)"
            : "var(--ink-500)",
        textDecoration: "none",
        transition: "color 160ms",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/**
 * Desktop-only utility strip above the nav.
 * - Quote mode (develop): product announce + account (My Jobs / avatar menu), never waitlist share.
 * - Waitlist mode (main): invite/share copy when enrolled.
 */
export default function TopUtilityBar({ waitlist }: { waitlist: boolean }) {
  const { t } = useLocale();
  const { status, user, signOut } = useMember();
  const sessionLoading = status === "loading";
  // In quote mode, a waitlist position must not revive invite-a-friend chrome.
  const waitlisted = waitlist && status === "waitlisted";
  const signedIn =
    !sessionLoading &&
    user != null &&
    (status === "signed_in" || status === "waitlisted");

  const onShare = () => {
    void shareWaitlistInvite({
      title: t("share.title"),
      text: t("share.text"),
      url: waitlistInviteUrl(),
    });
  };

  const memberLabel =
    waitlisted && user?.position
      ? t("nav.youreInPosition", { position: user.position })
      : t("nav.youreIn");

  return (
    <div
      style={{
        background: "var(--gray-50)",
        borderBottom: "1px solid var(--gray-100)",
      }}
    >
      <Container
        style={{
          position: "relative",
          height: 42,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {/* Center announcement — waitlist share only when site is waitlist mode */}
        <div
          style={{
            position: "absolute",
            left: 32,
            right: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--ink-700)",
            pointerEvents: "none",
          }}
        >
          <span style={{ pointerEvents: "auto", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <MvpBadge />
            <span>
              {waitlist ? (
                waitlisted ? (
                  <>
                    {t("util.youreOnTheList")}
                    <button
                      type="button"
                      onClick={onShare}
                      style={{
                        color: "var(--blue-deep)",
                        fontWeight: 700,
                        textDecoration: "none",
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: "inherit",
                      }}
                    >
                      {t("util.shareEarly")}
                    </button>
                  </>
                ) : (
                  <>
                    {t("util.announceWaitlist")}
                    <Link
                      href={JOIN_PATH}
                      style={{
                        color: "var(--blue-deep)",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      {t("util.joinEarly")}
                    </Link>
                  </>
                )
              ) : (
                <>
                  {t("util.announceServing")}
                  <Link
                    href={QUOTE_PATH}
                    style={{
                      color: "var(--blue-deep)",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    {t("util.bookToday")}
                  </Link>
                </>
              )}
            </span>
          </span>
        </div>

        <nav
          aria-label="Utility"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {sessionLoading ? (
            <QuoteAccountMenuSkeleton />
          ) : signedIn && user ? (
            waitlist && waitlisted ? (
              <>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--blue-deep)",
                  }}
                  title={user.email}
                >
                  {memberLabel}
                </span>
                <UtilButton onClick={() => void signOut()}>
                  {t("common.signOut")}
                </UtilButton>
              </>
            ) : (
              <>
                <UtilLink href="/jobs">My Jobs</UtilLink>
                <QuoteAccountMenu
                  user={user}
                  onSignOut={() => void signOut()}
                />
              </>
            )
          ) : (
            <UtilLink href={`${JOIN_PATH}?mode=login`}>{t("nav.login")}</UtilLink>
          )}
          <UtilLink href="#faq">{t("nav.contactUs")}</UtilLink>
        </nav>
      </Container>
    </div>
  );
}
