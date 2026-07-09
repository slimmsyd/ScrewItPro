"use client";

import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { CTA_LABEL } from "@/lib/site";

export default function Credibility({ onCta }: { onCta: () => void }) {
  return (
    <Reveal
      as="section"
      style={{ background: "var(--gray-50)", padding: "var(--section-pad-y) 0" }}
    >
      <Container style={{ textAlign: "center", maxWidth: 760 }}>
        <Badge variant="accent" style={{ marginBottom: 20 }}>
          Coming Soon: Customer Success Stories
        </Badge>
        <SectionTitle>
          Be Among the First to Experience the ScrewIt Pros Difference
        </SectionTitle>
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
          We’re helping busy families, seniors, professionals, and homeowners
          save time and avoid the frustration of furniture assembly.
        </p>
        <Button variant="primary" size="lg" onClick={onCta}>
          {CTA_LABEL}
        </Button>
      </Container>
    </Reveal>
  );
}
