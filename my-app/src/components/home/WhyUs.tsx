"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import Reveal from "@/components/ui/Reveal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * Why Choose ScrewIt Pros — white section with a driving loop whose
 * near-white plate was keyed out (WebM/MOV alpha) so the subject sits
 * on the real page white, not a washed-out video frame.
 */
export default function WhyUs() {
  const [active, setActive] = useState(0);
  const mobile = useIsMobile();
  const { t } = useLocale();

  const whyPoints = [
    { kicker: t("why.k1"), title: t("why.t1"), body: t("why.b1") },
    { kicker: t("why.k2"), title: t("why.t2"), body: t("why.b2") },
    { kicker: t("why.k3"), title: t("why.t3"), body: t("why.b3") },
    { kicker: t("why.k4"), title: t("why.t4"), body: t("why.b4") },
  ];

  return (
    <Reveal
      as="section"
      id="why"
      style={{
        position: "relative",
        background: "var(--white)",
        padding: "var(--section-pad-y) 0",
        overflow: "hidden",
        // Keep video + copy in one stacking context so mobile layers stay predictable
        isolation: "isolate",
      }}
    >
      {/* Decorative driving loop — behind copy; not interactive */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          tabIndex={-1}
          disablePictureInPicture
          controls={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            pointerEvents: "none",
            background: "transparent",
            WebkitTouchCallout: "none",
            userSelect: "none",
          }}
        >
          <source src="/assets/why-driving-loop.mov" type='video/mp4; codecs="hvc1"' />
          <source src="/assets/why-driving-loop.webm" type="video/webm" />
        </video>
      </div>

      <Container
        style={{
          position: "relative",
          // Content always above the car video (esp. mobile where video color was bleeding over)
          zIndex: 2,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow center>{t("why.eyebrow")}</Eyebrow>
          <SectionTitle center>{t("why.title")}</SectionTitle>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 17,
              lineHeight: "var(--leading-body)",
              color: "var(--text-muted)",
              maxWidth: "58ch",
              margin: "12px auto 0",
            }}
          >
            {t("why.sub")}
          </p>
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            borderRadius: "var(--radius-xl)",
            overflow: "hidden",
            // Solid white on mobile so video color doesn’t show through / steal taps
            background: mobile ? "var(--white)" : "rgba(255,255,255,0.94)",
            border: "1px solid var(--gray-100)",
            boxShadow: "0 18px 40px rgba(11,16,48,0.08)",
            maxWidth: mobile ? "100%" : 720,
            margin: "0 auto",
          }}
        >
          <div
            style={{
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
        </div>
      </Container>
    </Reveal>
  );
}
