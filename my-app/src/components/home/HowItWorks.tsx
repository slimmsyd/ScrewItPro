"use client";

import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";
import ImageSlot from "@/components/ui/ImageSlot";
import Reveal from "@/components/ui/Reveal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { CTA_LABEL } from "@/lib/site";

const steps = [
  {
    title: "Order Your Furniture",
    body: "Shop online or purchase furniture from your favorite retailer.",
  },
  {
    title: "We Pick It Up",
    body: "We collect it from your home, store, or receive it directly at our assembly hub.",
  },
  {
    title: "We Assemble It",
    body: "Our team professionally assembles your furniture in a dedicated workspace, not on your living room floor.",
  },
  {
    title: "We Deliver It Ready",
    body: "We deliver your furniture fully assembled, inspected, and ready to enjoy.",
  },
];

export default function HowItWorks({ onCta }: { onCta: () => void }) {
  const mobile = useIsMobile();
  return (
    <Reveal
      as="section"
      id="how"
      style={{
        background: "var(--gray-50)",
        padding: "var(--section-pad-y) 0",
        // Stay under hero search dropdown (hero z-index: 40)
        position: "relative",
        zIndex: 1,
      }}
    >
      <Container>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Eyebrow center>How It Works</Eyebrow>
          <SectionTitle center>From Box to Built in Four Steps</SectionTitle>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-lg)",
              lineHeight: "var(--leading-body)",
              color: "var(--text-muted)",
              maxWidth: "58ch",
              margin: "16px auto 0",
            }}
          >
            You order it. We pick it up, build it in our workshop, and deliver it
            ready to use.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 1.25fr",
            gap: mobile ? 32 : 48,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: mobile ? 24 : 32,
            }}
          >
            {steps.map((s, i) => (
              <div key={s.title}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 18,
                      color: "var(--blue-electric)",
                    }}
                  >
                    0{i + 1}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 19,
                      fontWeight: 600,
                      color: "var(--text-heading)",
                    }}
                  >
                    {s.title}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    lineHeight: "var(--leading-body)",
                    color: "var(--text-muted)",
                    margin: 0,
                    maxWidth: "46ch",
                  }}
                >
                  {s.body}
                </p>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <Button variant="primary" size="lg" onClick={onCta}>
                {CTA_LABEL}
              </Button>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              aspectRatio: "4 / 3.4",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              background: "var(--gray-100)",
            }}
          >
            <ImageSlot label="Photo: workshop assembly" />
          </div>
        </div>
      </Container>
    </Reveal>
  );
}
