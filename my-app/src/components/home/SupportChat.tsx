"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import ThinkingLoader from "@/components/ui/ThinkingLoader";
import { ASSETS, JOIN_PATH } from "@/lib/site";
import { useLocale } from "@/components/providers/LocaleProvider";

const PRICES: Record<string, number> = {
  Bed: 129,
  Desk: 69,
  Wardrobe: 129,
  "Office setup": 99,
  Cama: 129,
  Escritorio: 69,
  Armario: 129,
  Oficina: 99,
};

const THINK_MS = { min: 900, max: 1600 } as const;
function thinkDelay() {
  return THINK_MS.min + Math.floor(Math.random() * (THINK_MS.max - THINK_MS.min));
}

function ChipBubble({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <Image
        src={ASSETS.mascot}
        alt=""
        width={26}
        height={26}
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          objectFit: "cover",
          objectPosition: "top",
          flex: "none",
          marginTop: 2,
        }}
      />
      <div
        style={{
          background: "var(--gray-50)",
          border: "1px solid var(--gray-100)",
          borderRadius: "var(--radius-lg)",
          borderTopLeftRadius: 4,
          padding: "10px 14px",
          fontFamily: "var(--font-body)",
          fontSize: 14.5,
          lineHeight: "var(--leading-body)",
          color: "var(--ink-900)",
          maxWidth: 260,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function QuickReplies({
  options,
  onPick,
  disabled,
}: {
  options: string[];
  onPick: (opt: string) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        paddingLeft: 36,
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      {options.map((o) => (
        <button
          key={o}
          type="button"
          disabled={disabled}
          onClick={() => onPick(o)}
          style={{
            padding: "8px 14px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--blue-electric)",
            background: "var(--white)",
            color: "var(--blue-electric)",
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: disabled ? "default" : "pointer",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function SupportChat() {
  const router = useRouter();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [seen, setSeen] = useState(false);
  const [spin, setSpin] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [thinking, setThinking] = useState(false);
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setGreeted(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!spin) return;
    const timer = setTimeout(() => setSpin(false), 700);
    return () => clearTimeout(timer);
  }, [spin]);

  useEffect(() => {
    return () => {
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
    };
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [step, thinking, open]);

  // Map display option back to stable English keys for pricing/tier
  const locationKey = answers.locationKey as string | undefined;
  const itemKey = answers.itemKey as string | undefined;

  const tier = locationKey
    ? locationKey === "Houston Metro"
      ? "live"
      : locationKey === "Somewhere else"
        ? "unserved"
        : "expanding"
    : null;

  const locationOptions = useMemo(
    () => [
      { label: t("chat.optHouston"), key: "Houston Metro" },
      { label: t("chat.optAustin"), key: "Austin" },
      { label: t("chat.optDallas"), key: "Dallas" },
      { label: t("chat.optSanAntonio"), key: "San Antonio" },
      { label: t("chat.optAtlanta"), key: "Atlanta" },
      { label: t("chat.optElsewhere"), key: "Somewhere else" },
    ],
    [t]
  );

  function buildFlow() {
    const steps: {
      key: string;
      q: string;
      options: { label: string; key: string }[];
    }[] = [
      {
        key: "location",
        q: t("chat.qLocation"),
        options: locationOptions,
      },
    ];
    if (tier === "unserved") {
      steps.push({
        key: "waitlist",
        q: t("chat.qUnserved"),
        options: [{ label: t("chat.optWaitlist"), key: "waitlist" }],
      });
      return steps;
    }
    const city = answers.locationLabel || locationKey || "";
    steps.push({
      key: "item",
      q:
        tier === "expanding"
          ? t("chat.qItemExpanding", { city })
          : t("chat.qItem"),
      options: [
        { label: t("chat.optBed"), key: "Bed" },
        { label: t("chat.optDesk"), key: "Desk" },
        { label: t("chat.optWardrobe"), key: "Wardrobe" },
        { label: t("chat.optOffice"), key: "Office setup" },
      ],
    });
    steps.push({
      key: "pickup",
      q: t("chat.qPickup"),
      options: [
        { label: t("chat.optHome"), key: "home" },
        { label: t("chat.optStore"), key: "store" },
        { label: t("chat.optHub"), key: "hub" },
      ],
    });
    steps.push({
      key: "timeline",
      q: t("chat.qTimeline"),
      options: [
        { label: t("chat.optThisWeek"), key: "week" },
        { label: t("chat.optNoRush"), key: "norush" },
      ],
    });
    return steps;
  }

  const flow = buildFlow();
  const done = !thinking && step >= flow.length;
  const estimate = itemKey ? PRICES[itemKey] : null;

  const pick = (opt: { label: string; key: string }) => {
    if (thinking) return;
    const field = flow[step]?.key;
    if (!field) return;

    setThinking(true);
    if (thinkTimer.current) clearTimeout(thinkTimer.current);

    const next = { ...answers };
    if (field === "location") {
      next.locationKey = opt.key;
      next.locationLabel = opt.label;
    } else if (field === "item") {
      next.itemKey = opt.key;
      next.itemLabel = opt.label;
    } else if (field === "pickup") {
      next.pickupLabel = opt.label;
    } else if (field === "timeline") {
      next.timelineLabel = opt.label;
    } else {
      next[field] = opt.key;
    }

    thinkTimer.current = setTimeout(() => {
      setAnswers(next);
      setStep((s) => s + 1);
      setThinking(false);
      thinkTimer.current = null;
    }, thinkDelay());
  };

  const reset = () => {
    if (thinkTimer.current) {
      clearTimeout(thinkTimer.current);
      thinkTimer.current = null;
    }
    setThinking(false);
    setAnswers({});
    setStep(0);
  };

  const openChat = () => {
    setSeen(true);
    setSpin(true);
    setOpen(true);
  };
  const closeChat = () => {
    setSpin(true);
    setOpen(false);
  };
  const toggle = () => (open ? closeChat() : openChat());

  let bottomLine: string;
  let bottomPrice: string;
  let bottomCta: string | null;
  const city = answers.locationLabel || locationKey || "";

  if (tier === "unserved") {
    bottomLine = t("chat.outsideArea");
    bottomPrice = "-";
    bottomCta = done ? t("chat.joinWaitlist") : null;
  } else if (tier === "expanding") {
    bottomLine = `${answers.itemLabel || "-"} ${answers.pickupLabel ? `· ${answers.pickupLabel}` : ""} ${answers.timelineLabel ? `· ${answers.timelineLabel}` : ""} · ${t("chat.estAtLaunch", { city })}`;
    bottomPrice = estimate ? `$${estimate}` : "-";
    bottomCta = done ? t("chat.joinCityWaitlist", { city }) : null;
  } else {
    bottomLine = `${city ? city + " · " : ""}${answers.itemLabel || "-"} ${answers.pickupLabel ? `· ${answers.pickupLabel}` : ""} ${answers.timelineLabel ? `· ${answers.timelineLabel}` : ""}`;
    bottomPrice = estimate ? `$${estimate}` : "-";
    bottomCta = done ? t("chat.getExactQuote") : null;
  }
  if (thinking) bottomCta = null;

  const thinkingCaption =
    step >= Math.max(0, flow.length - 1)
      ? t("chat.buildingEstimate")
      : t("chat.thinking");

  return (
    <>
      {open && (
        <>
          <div
            onClick={closeChat}
            aria-hidden
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(11,16,48,0.32)",
              zIndex: 1200,
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chip support chat"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1201,
              width: 440,
              maxWidth: "calc(100vw - 32px)",
              maxHeight: "min(600px, calc(100vh - 32px))",
              background: "var(--white)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 20px",
                background: "var(--blue-deep)",
                color: "var(--white)",
              }}
            >
              <Image
                src={ASSETS.mascot}
                alt="Chip"
                width={38}
                height={38}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  objectFit: "cover",
                  objectPosition: "top",
                  border: "2px solid rgba(255,255,255,0.4)",
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {t("chat.title")}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    color: "var(--blue-200)",
                  }}
                >
                  {thinking ? t("chat.thinkingSubtitle") : t("chat.subtitle")}
                </div>
              </div>
              <button
                type="button"
                onClick={closeChat}
                aria-label={t("chat.close")}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--blue-200)",
                  display: "flex",
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              ref={bodyRef}
              style={{
                flex: 1,
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                overflowY: "auto",
                minHeight: 220,
              }}
            >
              {!done && !thinking && flow[step] && (
                <>
                  <ChipBubble>{flow[step].q}</ChipBubble>
                  <QuickReplies
                    options={flow[step].options.map((o) => o.label)}
                    onPick={(label) => {
                      const opt = flow[step].options.find((o) => o.label === label);
                      if (opt) pick(opt);
                    }}
                    disabled={thinking}
                  />
                </>
              )}

              {thinking && (
                <div
                  style={{
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--gray-100)",
                    background: "var(--gray-50)",
                    marginTop: 4,
                  }}
                >
                  <ThinkingLoader compact caption={thinkingCaption} />
                </div>
              )}

              {done && tier === "unserved" && (
                <ChipBubble>{t("chat.doneUnserved")}</ChipBubble>
              )}
              {done && tier !== "unserved" && (
                <ChipBubble>{t("chat.doneReady")}</ChipBubble>
              )}
            </div>

            <div
              style={{
                borderTop: "1px solid var(--gray-100)",
                padding: "16px 20px",
                background: "var(--gray-50)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: "var(--tracking-caps)",
                    textTransform: "uppercase",
                    color: "var(--ink-300)",
                  }}
                >
                  {t("chat.liveEstimate")}
                </div>
                {step > 0 && !thinking && (
                  <button
                    type="button"
                    onClick={reset}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--blue-electric)",
                    }}
                  >
                    {t("common.startOver")}
                  </button>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13.5,
                    color: "var(--ink-700)",
                    lineHeight: 1.4,
                  }}
                >
                  {thinking ? t("chat.updating") : bottomLine}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    color: "var(--blue-deep)",
                    flex: "none",
                  }}
                >
                  {thinking ? "…" : bottomPrice}
                </div>
              </div>
              {bottomCta && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => router.push(JOIN_PATH)}
                  style={{ width: "100%", marginTop: 12 }}
                >
                  {bottomCta}
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      <div
        style={{
          position: "fixed",
          right: 28,
          bottom: 28,
          zIndex: 1100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        {greeted && (
          <button
            type="button"
            onClick={openChat}
            className={`screwit-greeting${open ? " dismissed" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--white)",
              border: "1px solid var(--gray-200)",
              boxShadow: "var(--shadow-md)",
              borderRadius: "var(--radius-lg)",
              borderBottomRightRadius: 4,
              padding: "10px 16px",
              maxWidth: 240,
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--ink-900)",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <Image
              src={ASSETS.mascot}
              alt=""
              width={30}
              height={30}
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "top",
                flex: "none",
              }}
            />
            {t("chat.greeting")}
          </button>
        )}

        <button
          type="button"
          onClick={toggle}
          aria-label={open ? t("chat.close") : t("chat.open")}
          className={`screwit-launcher${spin ? " spin" : ""}${seen ? " seen" : ""}`}
        >
          {!seen && (
            <span className="screwit-ping" aria-hidden="true">
              1
            </span>
          )}
          <Image
            key={spin ? "spinning" : "idle"}
            className="screwit-mark"
            src={ASSETS.logoS}
            alt=""
            width={34}
            height={34}
            style={
              spin
                ? {
                    animation:
                      "screwitSpin 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                  }
                : undefined
            }
          />
        </button>
      </div>
    </>
  );
}
