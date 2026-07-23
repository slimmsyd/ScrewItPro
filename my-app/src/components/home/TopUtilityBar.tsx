"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import MvpBadge from "@/components/home/MvpBadge";
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

/**
 * Desktop utility strip above the nav — product announce only.
 * Account / sign-in lives next to "Get a Free Quote" in the main Nav.
 * Waitlist invite copy only when SITE is still waitlist mode.
 */
export default function TopUtilityBar({ waitlist }: { waitlist: boolean }) {
  const { t } = useLocale();
  const { status } = useMember();
  const waitlisted = waitlist && status === "waitlisted";

  const onShare = () => {
    void shareWaitlistInvite({
      title: t("share.title"),
      text: t("share.text"),
      url: waitlistInviteUrl(),
    });
  };

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
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              pointerEvents: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
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
            gap: 22,
          }}
        >
          <UtilLink href="#faq">{t("nav.contactUs")}</UtilLink>
        </nav>
      </Container>
    </div>
  );
}
