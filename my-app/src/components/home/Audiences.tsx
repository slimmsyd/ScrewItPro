"use client";

import Image from "next/image";
import { motion, MotionConfig } from "framer-motion";
import {
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Home,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionTitle from "@/components/ui/SectionTitle";
import { ASSETS } from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";

const CARD_W = 262;
const GAP = 16;

function AudienceCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 22,
        borderRadius: "var(--radius-lg)",
        background: "var(--gray-50)",
        border: "1px solid var(--gray-100)",
        width: CARD_W,
        minWidth: CARD_W,
        flex: `0 0 ${CARD_W}px`,
        boxSizing: "border-box",
      }}
    >
      <Icon size={24} color="var(--blue-electric)" aria-hidden />
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15.5,
          fontWeight: 600,
          color: "var(--text-heading)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13.5,
          lineHeight: 1.5,
          color: "var(--text-muted)",
        }}
      >
        {body}
      </div>
    </div>
  );
}

export default function Audiences() {
  const { t } = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const [halfWidth, setHalfWidth] = useState(0);

  const audiences = useMemo(
    () => [
      { icon: Briefcase, title: t("audiences.pros"), body: t("audiences.prosBody") },
      { icon: HeartHandshake, title: t("audiences.seniors"), body: t("audiences.seniorsBody") },
      { icon: Home, title: t("audiences.families"), body: t("audiences.familiesBody") },
      { icon: GraduationCap, title: t("audiences.students"), body: t("audiences.studentsBody") },
      { icon: KeyRound, title: t("audiences.managers"), body: t("audiences.managersBody") },
    ],
    [t]
  );

  const oneSetWidth =
    audiences.length * CARD_W + (audiences.length - 1) * GAP;

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.scrollWidth / 2;
      setHalfWidth(w > 0 ? w : oneSetWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [oneSetWidth, audiences]);

  const loopDistance = halfWidth || oneSetWidth;
  const duration = Math.max(18, loopDistance / 42);

  return (
    <>
      <section
        style={{
          background: "var(--white)",
          padding: "var(--section-pad-y) 0",
          overflow: "hidden",
        }}
      >
        <Container>
          <Eyebrow>{t("audiences.eyebrow")}</Eyebrow>
          <SectionTitle>{t("audiences.title")}</SectionTitle>
        </Container>

        <div
          style={{
            marginTop: 40,
            overflow: "hidden",
            width: "100%",
            maskImage:
              "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
            WebkitMaskImage:
              "linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent)",
          }}
        >
          <MotionConfig reducedMotion="never">
            <motion.div
              ref={trackRef}
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                gap: GAP,
                width: "max-content",
                willChange: "transform",
              }}
              animate={{ x: [0, -loopDistance] }}
              transition={{
                duration,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              }}
              aria-label={t("audiences.marqueeLabel")}
            >
              {audiences.map((a) => (
                <AudienceCard key={`a-${a.title}`} {...a} />
              ))}
              {audiences.map((a) => (
                <AudienceCard key={`b-${a.title}`} {...a} />
              ))}
            </motion.div>
          </MotionConfig>
        </div>
      </section>

      <section
        style={{
          background: "var(--white)",
          paddingTop: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px" }}>
          <Image
            src={ASSETS.audiencesCrew}
            alt={t("audiences.photoAlt")}
            width={1080}
            height={600}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 240,
            background:
              "linear-gradient(to bottom, rgba(244,246,251,0) 0%, var(--gray-50) 90%)",
            pointerEvents: "none",
          }}
        />
      </section>
    </>
  );
}
