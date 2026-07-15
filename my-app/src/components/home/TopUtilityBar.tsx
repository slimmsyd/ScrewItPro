"use client";

import { useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import MvpBadge from "@/components/home/MvpBadge";
import { JOIN_PATH } from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";

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

/** Desktop-only utility strip above the nav (announcement + login/contact). */
export default function TopUtilityBar({ waitlist }: { waitlist: boolean }) {
  const { t } = useLocale();
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
          <UtilLink href={JOIN_PATH}>{t("nav.login")}</UtilLink>
          <UtilLink href="#faq">{t("nav.contactUs")}</UtilLink>
        </nav>
      </Container>
    </div>
  );
}
