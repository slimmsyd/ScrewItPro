"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BadgeCheck,
  BedDouble,
  Briefcase,
  HeartHandshake,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import Container from "@/components/ui/Container";
import Badge from "@/components/ui/Badge";
import HeroSearch from "@/components/home/HeroSearch";
import HeroBackdrop from "@/components/home/HeroBackdrop";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ASSETS } from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";

/** Production default from design handoff: iso furniture wireframe. */
const HERO_BG = "wireframe" as const;

export default function Hero({ onCta }: { onCta: () => void }) {
  const [activeCat, setActiveCat] = useState(0);
  const mobile = useIsMobile();
  const { t } = useLocale();

  const heroCategories = [
    { icon: Wrench, label: t("hero.catAssembly") },
    { icon: Truck, label: t("hero.catPickup") },
    { icon: BedDouble, label: t("hero.catLarge") },
    { icon: Briefcase, label: t("hero.catOffice") },
    { icon: HeartHandshake, label: t("hero.catSenior") },
    { icon: Sparkles, label: t("hero.catWhiteGlove") },
    { icon: BadgeCheck, label: t("hero.catMembership") },
  ];

  const heroChips = [
    t("hero.chipGeneral"),
    t("hero.chipIkea"),
    t("hero.chipBed"),
    t("hero.chipDesk"),
    t("hero.chipWardrobe"),
  ];

  return (
    <header
      id="top"
      style={{
        background: "var(--white)",
        padding: mobile ? "32px 0 56px" : "72px 0 150px",
        position: "relative",
        zIndex: 40,
        overflow: "visible",
      }}
    >
      <HeroBackdrop variant={HERO_BG} mobile={mobile} />
      {!mobile && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 48,
            display: "flex",
            alignItems: "flex-end",
            gap: 14,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              alignSelf: "flex-start",
              marginTop: -8,
              padding: "10px 18px",
              borderRadius: "var(--radius-pill)",
              borderBottomRightRadius: 4,
              background: "var(--blue-50)",
              border: "1px solid var(--blue-100)",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--blue-deep)",
              whiteSpace: "nowrap",
            }}
          >
            {t("hero.mascotBubble")}
          </div>
          <Image
            src={ASSETS.mascot}
            alt="ScrewIt Pros"
            width={170}
            height={200}
            style={{
              width: 170,
              height: "auto",
              display: "block",
              marginBottom: -78,
            }}
          />
        </div>
      )}
      <Container
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Badge variant="brand" style={{ marginBottom: 24 }}>
          {t("hero.badge")}
        </Badge>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "var(--text-hero)",
            lineHeight: "var(--leading-display)",
            letterSpacing: "var(--tracking-display)",
            color: "var(--text-heading)",
            margin: "0 0 16px",
            maxWidth: "18ch",
          }}
        >
          {t("hero.title")}
        </h1>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: mobile ? 19 : 24,
            lineHeight: 1.25,
            letterSpacing: "var(--tracking-display)",
            color: "var(--blue-electric)",
            margin: "0 0 14px",
          }}
        >
          {t("hero.tagline")}
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-lg)",
            lineHeight: "var(--leading-body)",
            color: "var(--text-muted)",
            margin: "0 0 36px",
            maxWidth: "52ch",
          }}
        >
          {t("hero.sub")}
        </p>
        <HeroSearch onCta={onCta} />
        <div
          className="hscroll"
          style={{
            display: "flex",
            gap: 8,
            justifyContent: mobile ? "flex-start" : "center",
            flexWrap: "nowrap",
            width: "100%",
            overflowX: mobile ? "auto" : "visible",
            borderBottom: "1px solid var(--gray-100)",
            paddingBottom: 0,
            marginBottom: 28,
          }}
        >
          {heroCategories.map((c, i) => {
            const active = i === activeCat;
            const Icon = c.icon;
            return (
              <button
                key={c.label}
                type="button"
                onClick={() => setActiveCat(i)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  flex: "none",
                  whiteSpace: "nowrap",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: mobile ? "6px 12px 14px" : "6px 18px 16px",
                  borderBottom: `2px solid ${active ? "var(--blue-electric)" : "transparent"}`,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--blue-electric)" : "var(--ink-500)",
                }}
              >
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: active ? "var(--blue-50)" : "transparent",
                  }}
                >
                  <Icon
                    size={24}
                    color={
                      active ? "var(--blue-electric)" : "var(--ink-500)"
                    }
                  />
                </span>
                {c.label}
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {heroChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={onCta}
              style={{
                padding: "10px 22px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--ink-700)",
                background: "var(--white)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: 14.5,
                fontWeight: 600,
                color: "var(--ink-900)",
                transition: "background var(--duration-fast) var(--ease-out)",
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </Container>
    </header>
  );
}
