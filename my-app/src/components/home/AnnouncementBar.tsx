"use client";

import Link from "next/link";
import { JOIN_PATH } from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";
import MvpBadge from "@/components/home/MvpBadge";

/**
 * Mobile announcement strip — mirrors the desktop TopUtilityBar look:
 * gray surface, MVP pill, waitlist/serving copy + CTA link.
 */
export default function AnnouncementBar({ waitlist }: { waitlist: boolean }) {
  const { t } = useLocale();
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
        {waitlist ? t("util.announceWaitlist") : t("util.announceServing")}
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
      </span>
    </div>
  );
}
