"use client";

import Link from "next/link";
import { JOIN_PATH, QUOTE_PATH } from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useMember } from "@/components/providers/MemberProvider";
import MvpBadge from "@/components/home/MvpBadge";
import {
  shareWaitlistInvite,
  waitlistInviteUrl,
} from "@/lib/member";

/**
 * Mobile announcement strip - mirrors desktop TopUtilityBar:
 * quote mode never shows waitlist invite-a-friend; points to Get a Price.
 */
export default function AnnouncementBar({ waitlist }: { waitlist: boolean }) {
  const { t } = useLocale();
  const { status, user } = useMember();
  // Only honor waitlisted UX when the site is still in waitlist mode.
  const waitlisted = waitlist && status === "waitlisted";
  const signedIn =
    user != null &&
    (status === "signed_in" || status === "waitlisted") &&
    !waitlist;

  const onShare = () => {
    void shareWaitlistInvite({
      title: t("share.title"),
      text: t("share.text"),
      url: waitlistInviteUrl(),
    });
  };

  return (
    <div
      className="mobile-chrome-announce"
      style={{
        background: "var(--white)",
        borderBottom: "1px solid var(--gray-100)",
        color: "var(--ink-700)",
        textAlign: "center",
        padding: "8px 16px",
        fontFamily: "var(--font-body)",
        fontSize: 12.5,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexWrap: "wrap",
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
        ) : signedIn ? (
          <>
            Signed in ·{" "}
            <Link
              href="/jobs"
              style={{
                color: "var(--blue-deep)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              My Jobs
            </Link>
            {" · "}
            <Link
              href="/account"
              style={{
                color: "var(--blue-deep)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Account
            </Link>
          </>
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
            {" · "}
            <Link
              href={`${JOIN_PATH}?mode=login`}
              style={{
                color: "var(--blue-deep)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {t("nav.login")}
            </Link>
          </>
        )}
      </span>
    </div>
  );
}
