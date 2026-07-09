"use client";

import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import HoustonMap from "@/components/home/HoustonMap";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function ServiceArea() {
  const mobile = useIsMobile();

  return (
    <Reveal
      as="section"
      style={{ background: "var(--gray-50)", padding: "var(--section-pad-y) 0" }}
    >
      <Container>
        <div
          style={{
            textAlign: "center",
            maxWidth: 640,
            margin: "0 auto 36px",
          }}
        >
          <Eyebrow center>Service Area</Eyebrow>
          <SectionTitle center>
            Currently Serving the Houston Metro Area
          </SectionTitle>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              lineHeight: "var(--leading-body)",
              color: "var(--text-muted)",
              margin: "0 auto 24px",
            }}
          >
            Serving homeowners, renters, seniors, busy professionals, and
            families throughout the greater Houston area.
          </p>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--ink-700)",
              marginBottom: 12,
            }}
          >
            Expanding Soon
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {["Atlanta", "Austin", "San Antonio", "Dallas"].map((c) => (
              <Badge key={c} variant="neutral">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        <HoustonMap height={mobile ? 280 : 420} />
      </Container>
    </Reveal>
  );
}
