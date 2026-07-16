"use client";

import { useState } from "react";
import {
  Briefcase,
  Building2,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  Home,
  KeyRound,
  PackageOpen,
  Store,
  type LucideIcon,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Reveal from "@/components/ui/Reveal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";

const tints = {
  // Slightly softer pastels so mobile tiles don’t wash the section cool-grey
  blue: { bg: "#F5F8FF", fg: "#1D6EFE" },
  green: { bg: "#F3FAF6", fg: "#0E8A5F" },
  amber: { bg: "#FFF9F2", fg: "#B96A00" },
  purple: { bg: "#F8F5FF", fg: "#6D46C6" },
  teal: { bg: "#F2FAF9", fg: "#0E8A8A" },
  rose: { bg: "#FDF5F7", fg: "#C6325C" },
  indigo: { bg: "#F5F6FD", fg: "#3744BF" },
  sky: { bg: "#F4F9FD", fg: "#0F7BD9" },
} as const;

type Tint = keyof typeof tints;

function AudienceTile({
  icon: Icon,
  title,
  c,
}: {
  icon: LucideIcon;
  title: string;
  c: Tint;
}) {
  const [h, setH] = useState(false);
  const tint = tints[c];
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "11px 15px",
        borderRadius: "var(--radius-lg)",
        background: h ? tint.bg : "var(--white)",
        border: `1px solid ${h ? tint.fg : "var(--gray-100)"}`,
        cursor: "pointer",
        boxShadow: h ? "0 12px 26px -16px rgba(11,16,48,0.32)" : "none",
        transform: h ? "translateY(-2px)" : "none",
        transition:
          "background 200ms ease, border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
      }}
    >
      <span
        style={{
          flex: "none",
          width: 36,
          height: 36,
          borderRadius: 10,
          background: h ? "var(--white)" : tint.bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 200ms ease",
        }}
      >
        <Icon size={19} color={tint.fg} aria-hidden />
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: "var(--font-body)",
          fontSize: 15,
          fontWeight: 700,
          color: h ? tint.fg : "var(--text-heading)",
          transition: "color 200ms ease",
        }}
      >
        {title}
      </span>
      <ChevronRight size={16} color={h ? tint.fg : "var(--ink-300)"} aria-hidden />
    </div>
  );
}

export default function Audiences() {
  const mobile = useIsMobile();
  const { t } = useLocale();

  const audiences: { icon: LucideIcon; title: string; c: Tint }[] = [
    { icon: Briefcase, title: t("audiences.pros"), c: "blue" },
    { icon: HeartHandshake, title: t("audiences.seniors"), c: "rose" },
    { icon: Home, title: t("audiences.families"), c: "green" },
    { icon: GraduationCap, title: t("audiences.students"), c: "purple" },
    { icon: KeyRound, title: t("audiences.managers"), c: "amber" },
    { icon: Building2, title: t("audiences.renters"), c: "indigo" },
    { icon: Store, title: t("audiences.smallBiz"), c: "teal" },
    { icon: PackageOpen, title: t("audiences.newHomeowners"), c: "sky" },
  ];

  return (
    <Reveal
      as="section"
      style={{ background: "var(--white)", padding: "var(--section-pad-y) 0" }}
    >
      <Container>
        <Eyebrow>{t("audiences.eyebrow")}</Eyebrow>
        <h2
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: mobile
              ? "clamp(32px,8.5vw,42px)"
              : "clamp(46px,5.4vw,68px)",
            lineHeight: 1.03,
            letterSpacing: "-0.025em",
            color: "var(--text-heading)",
            margin: "10px 0 0",
          }}
        >
          {t("audiences.title")}
        </h2>
        <div
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)",
            gap: 14,
          }}
        >
          {audiences.map((a) => (
            <AudienceTile key={a.title} {...a} />
          ))}
        </div>
      </Container>
    </Reveal>
  );
}
