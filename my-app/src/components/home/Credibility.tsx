"use client";

import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function Credibility({
  onQuote,
  waitlist,
  ctaLabel,
}: {
  onQuote: () => void;
  waitlist: boolean;
  ctaLabel?: string;
}) {
  const { t } = useLocale();
  return (
    <Reveal
      as="section"
      style={{ background: "var(--white)", padding: "var(--section-pad-y) 0" }}
    >
      <Container
        style={{
          textAlign: "center",
          maxWidth: 760,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Badge variant="accent" style={{ marginBottom: 20 }}>
          {t("credibility.badge")}
        </Badge>
        <SectionTitle center>{t("credibility.title")}</SectionTitle>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            lineHeight: "var(--leading-body)",
            color: "var(--text-muted)",
            margin: "0 auto 28px",
            maxWidth: "56ch",
            textAlign: "center",
          }}
        >
          {t("credibility.body")}
        </p>
        <Button variant="primary" size="lg" onClick={onQuote}>
          {ctaLabel ??
            (waitlist ? t("common.joinNow") : t("common.getQuote"))}
        </Button>
      </Container>
    </Reveal>
  );
}
