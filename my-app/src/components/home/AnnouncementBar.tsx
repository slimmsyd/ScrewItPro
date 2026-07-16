"use client";

import Link from "next/link";
import { JOIN_PATH } from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";
import { useMember } from "@/components/providers/MemberProvider";
import MvpBadge from "@/components/home/MvpBadge";
import {
  shareWaitlistInvite,
  waitlistInviteUrl,
} from "@/lib/member";

/**
 * Mobile announcement strip - mirrors the desktop TopUtilityBar look:
 * gray surface, MVP pill, waitlist/serving copy + CTA link.
 */
export default function AnnouncementBar({ waitlist }: { waitlist: boolean }) {
  const { t } = useLocale();
  const { status } = useMember();
  const waitlisted = status === "waitlisted";

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
        {waitlisted
          ? t("util.youreOnTheList")
          : waitlist
            ? t("util.announceWaitlist")
            : t("util.announceServing")}
        {waitlisted ? (
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
        ) : (
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
      </span>
    </div>
  );
}
