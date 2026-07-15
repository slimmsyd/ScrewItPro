"use client";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import StepFlow from "@/components/home/StepFlow";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function HowItWorks() {
  const mobile = useIsMobile();
  const { t } = useLocale();

  const steps = [
    { title: t("how.step1Title"), body: t("how.step1Body") },
    { title: t("how.step2Title"), body: t("how.step2Body") },
    { title: t("how.step3Title"), body: t("how.step3Body") },
    { title: t("how.step4Title"), body: t("how.step4Body") },
  ];

  return (
    <Reveal
      as="section"
      id="how"
      style={{
        background: "var(--white)",
        padding: mobile ? "40px 0 72px" : "56px 0 140px",
      }}
    >
      <Container>
        <h2
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: mobile
              ? "clamp(34px, 9vw, 44px)"
              : "clamp(52px, 6.4vw, 84px)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            color: "var(--text-heading)",
            margin: mobile ? "0 0 40px" : "0 0 80px",
            maxWidth: "15ch",
          }}
        >
          {t("how.title")}
        </h2>
        <StepFlow steps={steps} />
      </Container>
    </Reveal>
  );
}
