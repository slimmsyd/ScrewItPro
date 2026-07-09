"use client";

import { useLocale } from "@/components/providers/LocaleProvider";

export default function AnnouncementBar() {
  const { t } = useLocale();
  return (
    <div
      style={{
        background: "var(--blue-electric)",
        color: "var(--white)",
        textAlign: "center",
        padding: "9px 16px",
        fontFamily: "var(--font-body)",
        fontSize: 13.5,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          padding: "2px 8px",
          borderRadius: "var(--radius-pill)",
          background: "rgba(255,255,255,0.2)",
          fontSize: 11,
          letterSpacing: "var(--tracking-caps)",
          textTransform: "uppercase",
        }}
      >
        {t("announce.mvp")}
      </span>
      {t("announce.text")}
    </div>
  );
}
