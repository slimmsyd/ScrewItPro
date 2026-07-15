"use client";

import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * Shared MVP pill used in the desktop utility bar and mobile announcement strip
 * so both surfaces stay visually identical.
 */
export default function MvpBadge() {
  const { t } = useLocale();
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
        padding: "2px 8px",
        borderRadius: "var(--radius-pill)",
        background: "var(--blue-electric)",
        color: "var(--white)",
        fontFamily: "var(--font-body)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "var(--tracking-caps)",
        textTransform: "uppercase",
        lineHeight: 1.3,
      }}
    >
      {t("announce.mvp")}
    </span>
  );
}
