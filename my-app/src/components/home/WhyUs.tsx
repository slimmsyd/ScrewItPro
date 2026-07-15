"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import Reveal from "@/components/ui/Reveal";
import WhyUsVignette from "@/components/home/WhyUsVignettes";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";
import { easeReveal } from "@/lib/motion";

export default function WhyUs() {
  const [active, setActive] = useState(0);
  const mobile = useIsMobile();
  const { t } = useLocale();
  const reduce = useReducedMotion() ?? false;

  const whyPoints = [
    { kicker: t("why.k1"), title: t("why.t1"), body: t("why.b1") },
    { kicker: t("why.k2"), title: t("why.t2"), body: t("why.b2") },
    { kicker: t("why.k3"), title: t("why.t3"), body: t("why.b3") },
    { kicker: t("why.k4"), title: t("why.t4"), body: t("why.b4") },
  ];

  const chipLabels = [
    t("why.v1Chip"),
    t("why.v2Chip"),
    t("why.v3Chip"),
    t("why.v4Chip"),
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
                <button
                  key={p.title}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: "none",
                    cursor: "pointer",
                    padding: isActive ? "22px 0 22px 24px" : "18px 0 18px 24px",
                    border: "none",
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
                </button>
              );
            })}
          </div>
          <div
            style={{
              position: "relative",
              background:
                "linear-gradient(135deg, var(--blue-50), var(--gray-50))",
              minHeight: mobile ? 280 : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduce ? 0 : 0.26, ease: easeReveal }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <WhyUsVignette index={active} label={chipLabels[active]} reduce={reduce} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </Reveal>
  );
}
