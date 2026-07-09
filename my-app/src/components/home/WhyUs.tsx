"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import ImageSlot from "@/components/ui/ImageSlot";
import Reveal from "@/components/ui/Reveal";
import { useIsMobile } from "@/hooks/useIsMobile";

const whyPoints = [
  {
    kicker: "Built in Our Workshop",
    title: "Professional Workshop Assembly",
    body: "Your furniture is assembled in a dedicated workspace with the proper tools and equipment.",
    ph: "Photo: workshop floor",
  },
  {
    kicker: "Your Home Stays Yours",
    title: "Less Stress, Less Mess",
    body: "No cardboard piles, loose hardware, or assembly projects taking over your home.",
    ph: "Photo: clean living room",
  },
  {
    kicker: "Inspected & Photographed",
    title: "Quality Checked Before Delivery",
    body: "Every item is inspected and photographed before it leaves our facility.",
    ph: "Photo: quality inspection",
  },
  {
    kicker: "Just Point to the Spot",
    title: "Delivered Ready to Use",
    body: "When we arrive, your furniture is already assembled. We simply place it where you want it.",
    ph: "Photo: white glove delivery",
  },
];

export default function WhyUs() {
  const [active, setActive] = useState(0);
  const mobile = useIsMobile();

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
            Why Choose ScrewIt Pros?
          </Eyebrow>
          <SectionTitle inverse center>
            We Don’t Build Furniture on Your Living Room Floor
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
            Most assembly services show up at your home surrounded by kids,
            pets, distractions, and limited space. ScrewIt Pros is different.
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
