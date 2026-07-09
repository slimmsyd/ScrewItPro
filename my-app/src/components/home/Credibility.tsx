"use client";

import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function Credibility({ onCta }: { onCta: () => void }) {
  const { t } = useLocale();
  return (
    <Reveal
      as="section"
      style={{ background: "var(--gray-50)", padding: "var(--section-pad-y) 0" }}
    >
      <Container style={{ textAlign: "center", maxWidth: 760 }}>
        <Badge variant="accent" style={{ marginBottom: 20 }}>
          {t("credibility.badge")}
        </Badge>
        <SectionTitle>{t("credibility.title")}</SectionTitle>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            lineHeight: "var(--leading-body)",
            color: "var(--text-muted)",
            margin: "0 auto 28px",
            maxWidth: "56ch",
          }}
        >
          {t("credibility.body")}
        </p>
        <Button variant="primary" size="lg" onClick={onCta}>
          {t("common.joinNow")}
        </Button>
      </Container>
    </Reveal>
  );
}
