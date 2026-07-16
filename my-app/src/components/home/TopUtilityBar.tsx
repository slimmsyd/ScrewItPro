"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import MvpBadge from "@/components/home/MvpBadge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useMember } from "@/components/providers/MemberProvider";
import { JOIN_PATH } from "@/lib/site";
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

/** Desktop-only utility strip above the nav (announcement + login/contact). */
export default function TopUtilityBar({ waitlist }: { waitlist: boolean }) {
  const { t } = useLocale();
  const { status, user, signOut } = useMember();
  const waitlisted = status === "waitlisted";

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
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
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
          }}
        >
          <MvpBadge />
          <span>
            {waitlisted
              ? t("util.youreOnTheList")
              : waitlist
                ? t("util.announceWaitlist")
                : t("util.announceServing")}
            {!waitlisted && (
              <Link
                href={JOIN_PATH}
                style={{
                  color: "var(--blue-deep)",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                {waitlist ? t("util.joinEarly") : t("util.bookToday")}
              </Link>
            )}
            {waitlisted && (
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
            )}
          </span>
        </div>
        <nav
          aria-label="Utility"
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 22,
          }}
        >
          {waitlisted || status === "signed_in" ? (
            <>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--blue-deep)",
                }}
                title={user?.email || undefined}
              >
                {waitlisted ? memberLabel : t("nav.youreIn")}
              </span>
              <UtilButton onClick={() => void signOut()}>
                {t("common.signOut")}
              </UtilButton>
            </>
          ) : (
            <UtilLink href={`${JOIN_PATH}?mode=login`}>{t("nav.login")}</UtilLink>
          )}
          <UtilLink href="#faq">{t("nav.contactUs")}</UtilLink>
        </nav>
      </Container>
    </div>
  );
}
