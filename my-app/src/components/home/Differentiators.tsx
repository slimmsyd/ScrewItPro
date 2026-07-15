"use client";

import { useState, type ReactNode } from "react";
import {
  Check,
  Clock,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { motion, MotionConfig } from "framer-motion";
import Container from "@/components/ui/Container";
import ImageSlot from "@/components/ui/ImageSlot";
import Reveal from "@/components/ui/Reveal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * Recognizable Texas silhouette with a Houston coverage pin. The wide viewBox
 * lets the state fill the card width; a soft radial glow + dashed service-radius
 * rings anchor the pin so it reads as an intentional coverage graphic.
 */
function TexasMap({ label }: { label: string }) {
  // Houston sits in the south-east, just inland from the Gulf coast.
  const HX = 348;
  const HY = 284;
  return (
    <svg
      viewBox="0 0 516 400"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      style={{ display: "block" }}
      aria-label={`Texas - ${label} service area`}
    >
      <defs>
        <radialGradient id="houston-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.16)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id="texas-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.09)" />
        </linearGradient>
      </defs>

      {/* Coverage glow radiating from Houston */}
      <circle cx={HX} cy={HY} r="130" fill="url(#houston-glow)" />

      {/* Texas silhouette (panhandle, El Paso point, Gulf coast, south tip) */}
      <path
        d="M238 40 L300 40 L300 120 L360 120 L392 128 L430 150 L438 210 L410 250 L378 268 L348 288 L312 300 L300 330 L270 366 L250 320 L222 288 L190 258 L150 222 L110 188 L78 162 L170 150 L170 120 L238 120 Z"
        fill="url(#texas-fill)"
        stroke="rgba(255,255,255,0.78)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Service-radius rings around the pin */}
      <circle
        cx={HX}
        cy={HY}
        r="40"
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
        strokeDasharray="3 6"
      />
      <circle
        cx={HX}
        cy={HY}
        r="66"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
        strokeDasharray="3 7"
      />

      {/* Pin: animated ping + solid dot */}
      <circle className="map-ping" cx={HX} cy={HY} r="11" fill="var(--white)" />
      <circle cx={HX} cy={HY} r="7.5" fill="var(--white)" />
      <circle cx={HX} cy={HY} r="3.4" fill="var(--blue-electric)" />
      <text
        x={HX}
        y={HY - 22}
        textAnchor="middle"
        fill="var(--white)"
        style={{ fontFamily: "var(--font-body)", fontSize: 19, fontWeight: 700 }}
      >
        {label}
      </text>
    </svg>
  );
}

type FeatureCard = {
  key: string;
  grad: boolean;
  bg?: string;
  eyebrow?: string;
  title: string;
  body: string;
  img: string;
  ph: string;
  vis: number;
  big?: boolean;
  /** Full-bleed scene art (e.g. living-room mascot) fills the visual band */
  scene?: boolean;
  noShadow?: boolean;
  alignRight?: boolean;
  texasFallback?: boolean;
  /** Render the Houston coverage map as the primary visual (not just fallback) */
  map?: boolean;
  /** Full-bleed image that covers the whole visual band (e.g. a map) */
  cover?: boolean;
};

function CardVisual({ card }: { card: FeatureCard }) {
  const mobile = useIsMobile();
  const { t } = useLocale();
  const [imgOk, setImgOk] = useState(true);

  const useMap = card.map === true;
  const showImg = !useMap && imgOk && !!card.img;
  const showTexas = useMap || (!imgOk && card.texasFallback);

  return (
    <div
      style={{
        marginTop: "auto",
        height: mobile ? (card.scene ? 200 : 180) : card.vis,
        overflow: "hidden",
        background:
          showImg || showTexas
            ? "transparent"
            : card.grad
              ? "rgba(255,255,255,0.1)"
              : "var(--white)",
        display: "flex",
        alignItems: showTexas ? "center" : card.scene ? "center" : "flex-end",
        justifyContent: card.alignRight ? "flex-end" : "center",
        padding: card.cover ? (mobile ? "0 14px" : "0 18px") : undefined,
      }}
    >
      {showImg ? (
        // Decorative; plain img so onError can trigger the fallback.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={card.img}
          alt=""
          onError={() => setImgOk(false)}
          style={{
            width: card.scene || card.cover ? "100%" : undefined,
            maxWidth: card.cover
              ? "100%"
              : card.scene
                ? "100%"
                : card.big
                  ? "112%"
                  : "86%",
            maxHeight: card.cover
              ? "100%"
              : card.scene
                ? "100%"
                : card.big
                  ? "116%"
                  : "90%",
            height: card.scene || card.cover ? "100%" : undefined,
            objectFit: card.cover ? "cover" : "contain",
            objectPosition: card.cover
              ? "center"
              : card.scene
                ? "center bottom"
                : "center",
            borderRadius: card.cover ? "8px 8px 0 0" : undefined,
            display: "block",
            filter:
              card.noShadow || card.cover
                ? "none"
                : card.big || card.scene
                  ? "drop-shadow(0 16px 30px rgba(4,20,90,0.35))"
                  : "drop-shadow(0 18px 30px rgba(4,32,155,0.35))",
          }}
        />
      ) : showTexas ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: mobile ? "2px 8px 10px" : "4px 12px 14px",
          }}
        >
          <TexasMap label={t("diff.houstonLabel")} />
        </div>
      ) : (
        <ImageSlot label={card.ph} style={{ minHeight: "100%", width: "100%" }} />
      )}
    </div>
  );
}

function FeatureTile({ card, mobile }: { card: FeatureCard; mobile: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: card.grad ? card.bg : "var(--gray-50)",
        border: card.grad ? "none" : "1px solid var(--gray-100)",
        height: "100%",
        minHeight: mobile ? undefined : 420,
      }}
    >
      <div style={{ padding: mobile ? "22px 22px 16px" : "26px 28px 18px" }}>
        {card.eyebrow && (
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "var(--tracking-caps)",
              textTransform: "uppercase",
              color: card.grad
                ? "rgba(255,255,255,0.72)"
                : "var(--blue-electric)",
              marginBottom: 10,
            }}
          >
            {card.eyebrow}
          </span>
        )}
        <h3
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: mobile ? 19 : 21,
            lineHeight: 1.14,
            letterSpacing: "-0.02em",
            color: card.grad ? "var(--white)" : "var(--text-heading)",
            margin: "0 0 8px",
            textWrap: "balance",
          }}
        >
          {card.title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: mobile ? 14.5 : 15,
            lineHeight: "var(--leading-body)",
            color: card.grad ? "rgba(255,255,255,0.9)" : "var(--text-muted)",
            margin: 0,
          }}
        >
          {card.body}
        </p>
      </div>
      <CardVisual card={card} />
    </div>
  );
}

/** Soft trust card (Lugg-style): copy left, decorative cluster right. */
function TrustCard({
  title,
  body,
  visual,
  mobile,
}: {
  title: string;
  body: ReactNode;
  visual: ReactNode;
  mobile: boolean;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: mobile ? "1fr" : "1.05fr 0.95fr",
        alignItems: "center",
        gap: mobile ? 16 : 12,
        background: "var(--gray-50)",
        border: "1px solid var(--gray-100)",
        borderRadius: 24,
        padding: mobile ? "22px 20px" : "28px 28px 28px 32px",
        minHeight: mobile ? undefined : 200,
      }}
    >
      <div>
        <h3
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: mobile ? 20 : 24,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "var(--ink-900)",
            margin: "0 0 10px",
            textWrap: "balance",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: mobile ? 14.5 : 15.5,
            lineHeight: 1.55,
            color: "var(--ink-500)",
            margin: 0,
            maxWidth: "36ch",
          }}
        >
          {body}
        </p>
      </div>
      <div
        aria-hidden
        style={{
          position: "relative",
          minHeight: mobile ? 140 : 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {visual}
      </div>
    </div>
  );
}

/** Polar → cartesian (0° = right, clockwise-friendly for layout). */
function polar(angleDeg: number, radius: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

function GuaranteeVisual() {
  /**
   * Framer Motion float-orbit (more reliable than CSS keyframes).
   * Nested MotionConfig reducedMotion="never" so OS "Reduce motion"
   * does not freeze this decorative cluster (it was stuck before).
   */
  const shields = [
    { angle: -50, radius: 58, duration: 7.2, delay: 0, size: 28 },
    { angle: -10, radius: 54, duration: 8.0, delay: 0.4, size: 26 },
    { angle: 35, radius: 60, duration: 6.8, delay: 0.9, size: 28 },
    { angle: 85, radius: 56, duration: 7.6, delay: 0.2, size: 26 },
    { angle: 145, radius: 58, duration: 8.4, delay: 1.1, size: 28 },
    { angle: 200, radius: 54, duration: 7.0, delay: 0.6, size: 26 },
    { angle: 255, radius: 60, duration: 7.8, delay: 1.4, size: 28 },
  ] as const;

  const solid = { angle: 50, radius: 52, duration: 8.5, delay: 0.3 };

  return (
    // Force motion for this decorative bit - CSS was frozen by reduced-motion
    <MotionConfig reducedMotion="never">
      <div
        className="guarantee-visual"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 200,
          height: 168,
          margin: "0 auto",
        }}
      >
        <div aria-hidden className="guarantee-glow" />

        {/* Layer order: glow → mascot (back) → floating checks (front) */}
        <motion.img
          src="/assets/mascot-thumbs-up.png"
          alt=""
          draggable={false}
          className="guarantee-mascot"
          style={{
            position: "absolute",
            left: "50%",
            top: "52%",
            width: 118,
            height: 118,
            marginLeft: -59,
            marginTop: -59,
            objectFit: "contain",
            zIndex: 1,
            pointerEvents: "none",
            userSelect: "none",
            filter: "drop-shadow(0 10px 16px rgba(4, 32, 155, 0.16))",
          }}
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {shields.map((p, i) => {
          const home = polar(p.angle, p.radius);
          const far = polar(p.angle + 16, p.radius * 1.12);
          const near = polar(p.angle - 14, p.radius * 0.86);
          const mid = polar(p.angle + 4, p.radius * 1.02);

          return (
            <motion.div
              key={i}
              aria-hidden
              className="guarantee-shield"
              style={{
                width: p.size,
                height: p.size,
                position: "absolute",
                left: "50%",
                top: "52%",
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                zIndex: 3,
              }}
              initial={{ x: home.x, y: home.y, scale: 1, opacity: 0.9 }}
              animate={{
                x: [home.x, far.x, mid.x, near.x, home.x],
                y: [home.y, far.y - 6, mid.y + 4, near.y - 3, home.y],
                scale: [1, 1.12, 1.02, 0.88, 1],
                opacity: [0.88, 1, 0.95, 0.68, 0.88],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.28, 0.5, 0.78, 1],
              }}
            >
              <ShieldCheck
                size={Math.round(p.size * 0.5)}
                color="#16a34a"
                strokeWidth={2.4}
              />
            </motion.div>
          );
        })}

        {/* Solid green check - same language, slightly closer */}
        {(() => {
          const home = polar(solid.angle, solid.radius);
          const far = polar(solid.angle + 14, solid.radius * 1.1);
          const near = polar(solid.angle - 12, solid.radius * 0.88);
          return (
            <motion.div
              aria-hidden
              className="guarantee-check-solid"
              style={{
                position: "absolute",
                left: "50%",
                top: "52%",
                marginLeft: -17,
                marginTop: -17,
                zIndex: 4,
              }}
              initial={{ x: home.x, y: home.y, scale: 1, opacity: 1 }}
              animate={{
                x: [home.x, far.x, near.x, home.x],
                y: [home.y, far.y - 5, near.y + 3, home.y],
                scale: [1, 1.1, 0.9, 1],
                opacity: [0.95, 1, 0.8, 0.95],
              }}
              transition={{
                duration: solid.duration,
                delay: solid.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Check size={15} color="white" strokeWidth={3} />
            </motion.div>
          );
        })()}
      </div>
    </MotionConfig>
  );
}

function RatedVisual({
  names,
  traits,
}: {
  names: string;
  traits: { label: string; icon: ReactNode }[];
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 240,
        height: 168,
      }}
    >
      {/* Trait chips */}
      {traits.map((tr, i) => {
        const spots = [
          { top: 4, left: 8 },
          { top: 4, right: 8, left: "auto" as const },
          { top: 58, left: 0 },
          { top: 58, right: 0, left: "auto" as const },
          { bottom: 8, left: "50%", transform: "translateX(-50%)" },
        ];
        const s = spots[i] ?? spots[0];
        return (
          <div
            key={tr.label}
            style={{
              position: "absolute",
              ...s,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--white)",
              border: "1px solid var(--gray-100)",
              borderRadius: 12,
              padding: "7px 10px",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ink-700)",
              boxShadow: "0 6px 16px rgba(11,16,48,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            {tr.icon}
            {tr.label}
          </div>
        );
      })}

      {/* Avatar pair + stars */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", marginLeft: 10 }}>
          {["#1d6efe", "#04209b"].map((c, i) => (
            <div
              key={c}
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: `linear-gradient(145deg, ${c}, ${i ? "#1d6efe" : "#436db5"})`,
                border: "3px solid var(--white)",
                marginLeft: i ? -14 : 0,
                boxShadow: "0 8px 18px rgba(4,32,155,0.2)",
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--ink-700)",
          }}
        >
          {names}
        </span>
        <div style={{ display: "flex", gap: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              fill="#f5c542"
              color="#f5c542"
              strokeWidth={0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Differentiators grid:
 *  - Top: two brand feature cards
 *  - Bottom: Lugg-style double trust stack (left) + grey pickup card pushed right
 */
export default function Differentiators() {
  const mobile = useIsMobile();
  const { t } = useLocale();

  const topCards: FeatureCard[] = [
    {
      key: "why",
      grad: true,
      bg: "linear-gradient(115deg, var(--blue-deep), var(--blue-electric))",
      eyebrow: t("diff.whyEyebrow"),
      title: t("diff.whyTitle"),
      body: t("diff.whyBody"),
      // Living-room mascot scene (transparent PNG) under Why ScrewIt Pros
      img: "/assets/mascot-livingroom.png?v=1",
      ph: t("diff.whyPh"),
      vis: 260,
      scene: true,
      noShadow: true,
    },
    {
      key: "houston",
      grad: true,
      bg: "linear-gradient(135deg, var(--blue-electric), var(--blue-steel))",
      title: t("diff.houstonTitle"),
      body: t("diff.houstonBody"),
      // Full-bleed Houston route map; falls back to the SVG state if missing
      img: "/assets/houston-route-map.jpg",
      ph: t("diff.houstonPh"),
      vis: 330,
      cover: true,
      texasFallback: true,
    },
  ];

  const pickupCard: FeatureCard = {
    key: "pickup",
    grad: false,
    title: t("diff.pickupTitle"),
    body: t("diff.pickupBody"),
    // Door-handoff scene sits in the grey card visual band
    img: "/assets/delivery-handoff.png?v=1",
    ph: t("diff.pickupPh"),
    vis: 260,
    scene: true,
    noShadow: true,
  };

  const traits = [
    {
      label: t("diff.traitFast"),
      icon: <Zap size={13} color="var(--blue-electric)" fill="var(--blue-100)" />,
    },
    {
      label: t("diff.traitReliable"),
      icon: <Sparkles size={13} color="var(--blue-electric)" />,
    },
    {
      label: t("diff.traitFriendly"),
      icon: <HeartHandshake size={13} color="var(--blue-electric)" />,
    },
    {
      label: t("diff.traitEfficient"),
      icon: <Clock size={13} color="var(--blue-electric)" />,
    },
    {
      label: t("diff.traitHelpful"),
      icon: <ShieldCheck size={13} color="var(--blue-electric)" />,
    },
  ];

  return (
    <Reveal
      as="section"
      id="about"
      style={{ background: "var(--white)", padding: mobile ? "44px 0" : "64px 0" }}
    >
      <Container>
        <h2
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: mobile
              ? "clamp(30px, 8vw, 40px)"
              : "clamp(40px, 4.4vw, 60px)",
            lineHeight: 1.04,
            letterSpacing: "-0.025em",
            color: "var(--text-heading)",
            margin: mobile ? "0 0 32px" : "0 0 52px",
            maxWidth: "16ch",
          }}
        >
          {t("diff.heading")}
        </h2>

        {/* Top pair */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)",
            gap: mobile ? 14 : 18,
            marginBottom: mobile ? 14 : 18,
          }}
        >
          {topCards.map((c) => (
            <FeatureTile key={c.key} card={c} mobile={mobile} />
          ))}
        </div>

        {/*
          Bottom band: double trust stack fills left white space;
          grey pickup card is pushed to the right (no more centered orphan).
        */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "1.15fr 0.85fr",
            gap: mobile ? 14 : 18,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: mobile ? 14 : 16,
            }}
          >
            <TrustCard
              mobile={mobile}
              title={t("diff.guaranteeTitle")}
              body={
                <>
                  {t("diff.guaranteeBody")}{" "}
                  <span
                    style={{
                      color: "var(--blue-electric)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                      fontWeight: 600,
                    }}
                  >
                    {t("diff.guaranteeLink")}
                  </span>
                  .
                </>
              }
              visual={<GuaranteeVisual />}
            />
            <TrustCard
              mobile={mobile}
              title={t("diff.ratedTitle")}
              body={t("diff.ratedBody")}
              visual={
                <RatedVisual names={t("diff.ratedNames")} traits={traits} />
              }
            />
          </div>

          <FeatureTile card={pickupCard} mobile={mobile} />
        </div>
      </Container>
    </Reveal>
  );
}
