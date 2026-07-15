"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import ImageSlot from "@/components/ui/ImageSlot";
import Reveal from "@/components/ui/Reveal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function WhyUs() {
  const [active, setActive] = useState(0);
  const mobile = useIsMobile();
  const { t } = useLocale();

  const whyPoints = [
    { kicker: t("why.k1"), title: t("why.t1"), body: t("why.b1"), ph: t("why.p1") },
    { kicker: t("why.k2"), title: t("why.t2"), body: t("why.b2"), ph: t("why.p2") },
    { kicker: t("why.k3"), title: t("why.t3"), body: t("why.b3"), ph: t("why.p3") },
    { kicker: t("why.k4"), title: t("why.t4"), body: t("why.b4"), ph: t("why.p4") },
  ];

  return (
    <Reveal
      as="section"
      id="why"
      style={{
        background: "var(--blue-deep)",
        padding: "var(--section-pad-y) 0",
      }}
    >
      <Container>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow color="var(--blue-300)" center>
            {t("why.eyebrow")}
          </Eyebrow>
          <SectionTitle inverse center>
            {t("why.title")}
          </SectionTitle>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 17,
              lineHeight: "var(--leading-body)",
              color: "var(--blue-200)",
              maxWidth: "58ch",
              margin: "12px auto 0",
            }}
          >
            {t("why.sub")}
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 1.2fr",
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            minHeight: mobile ? "auto" : 520,
          }}
        >
          <div
            style={{
              background: "var(--gray-50)",
              padding: mobile ? "28px 20px" : "48px 44px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {whyPoints.map((p, i) => {
              const isActive = i === active;
              return (
                <div
                  key={p.title}
                  onClick={() => setActive(i)}
                  style={{
                    cursor: "pointer",
                    padding: isActive ? "22px 0 22px 24px" : "18px 0 18px 24px",
                    borderLeft: `2px solid ${isActive ? "var(--blue-electric)" : "transparent"}`,
                    borderTop: i > 0 ? "1px solid var(--gray-200)" : "none",
                    transition:
                      "border-color var(--duration-fast) var(--ease-out)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      letterSpacing: "var(--tracking-caps)",
                      textTransform: "uppercase",
                      color: isActive
                        ? "var(--blue-electric)"
                        : "var(--ink-300)",
                      marginBottom: 6,
                    }}
                  >
                    {p.kicker}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 400,
                      fontSize: isActive ? 27 : 22,
                      letterSpacing: "var(--tracking-display)",
                      color: isActive
                        ? "var(--text-heading)"
                        : "var(--ink-500)",
                      transition:
                        "font-size var(--duration-fast) var(--ease-out)",
                    }}
                  >
                    {p.title}
                  </div>
                  {isActive && (
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: 15,
                        lineHeight: "var(--leading-body)",
                        color: "var(--text-muted)",
                        margin: "10px 0 0",
                        maxWidth: "46ch",
                      }}
                    >
                      {p.body}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: "relative",
              background: "var(--gray-100)",
              minHeight: mobile ? 240 : "auto",
            }}
          >
            {whyPoints.map((p, i) => (
              <div
                key={p.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: i === active ? "block" : "none",
                }}
              >
                <ImageSlot label={p.ph} style={{ minHeight: "100%" }} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Reveal>
  );
}
