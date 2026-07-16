"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";

function FaqRow({
  title,
  content,
  open,
  onToggle,
}: {
  title: string;
  content: string;
  open: boolean;
  onToggle: () => void;
}) {
  const [h, setH] = useState(false);
  const active = open || h;
  return (
    <div style={{ borderBottom: "1px solid var(--gray-100)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          padding: "20px 2px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.3,
            color: active ? "var(--blue-electric)" : "var(--text-heading)",
            transition: "color 180ms ease",
          }}
        >
          {title}
        </span>
        <Plus
          size={22}
          color={active ? "var(--blue-electric)" : "var(--ink-300)"}
          style={{
            flex: "none",
            transition:
              "transform 260ms cubic-bezier(.16,1,.3,1), color 180ms ease",
            transform: open ? "rotate(45deg)" : "none",
          }}
          aria-hidden
        />
      </button>
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? 320 : 0,
          transition: "max-height 320ms cubic-bezier(.16,1,.3,1)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15.5,
            lineHeight: "var(--leading-body)",
            color: "var(--text-muted)",
            margin: 0,
            padding: "0 2px 22px",
            maxWidth: "52ch",
          }}
        >
          {content}
        </p>
      </div>
    </div>
  );
}

function FaqCta({ onClick, label }: { onClick: () => void; label: string }) {
  const [h, setH] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        cursor: "pointer",
        background: h ? "var(--blue-electric)" : "transparent",
        color: h ? "var(--white)" : "var(--blue-electric)",
        border: "1.5px solid var(--blue-electric)",
        borderRadius: "var(--radius-pill)",
        padding: "16px 52px",
        fontFamily: "var(--font-body)",
        fontSize: 16,
        fontWeight: 700,
        transition: "background 200ms ease, color 200ms ease",
      }}
    >
      {label}
    </button>
  );
}

export default function FAQ({
  onQuote,
  waitlist,
  ctaLabel,
}: {
  onQuote: () => void;
  waitlist: boolean;
  ctaLabel?: string;
}) {
  const mobile = useIsMobile();
  const { t } = useLocale();
  const [open, setOpen] = useState<number | null>(null);

  const faqs = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        title: t(`faq.q${i + 1}`),
        content: t(`faq.a${i + 1}`),
      })),
    [t]
  );

  const mid = Math.ceil(faqs.length / 2);
  const cols = [faqs.slice(0, mid), faqs.slice(mid)];

  return (
    <Reveal
      as="section"
      id="faq"
      style={{ background: "var(--white)", padding: "var(--section-pad-y) 0" }}
    >
      <Container>
        <h2
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: mobile
              ? "clamp(32px,8.5vw,42px)"
              : "clamp(46px,5.4vw,68px)",
            lineHeight: 1.03,
            letterSpacing: "-0.025em",
            color: "var(--text-heading)",
            margin: mobile ? "0 0 32px" : "0 0 56px",
          }}
        >
          {t("faq.title")}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "repeat(2, 1fr)",
            columnGap: 64,
            rowGap: 0,
          }}
        >
          {cols.map((col, ci) => (
            <div key={ci}>
              {col.map((item, ii) => {
                const idx = ci * mid + ii;
                return (
                  <FaqRow
                    key={item.title}
                    title={item.title}
                    content={item.content}
                    open={open === idx}
                    onToggle={() => setOpen(open === idx ? null : idx)}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: mobile ? 40 : 60,
          }}
        >
          <FaqCta
            onClick={onQuote}
            label={
              ctaLabel ??
              (waitlist ? t("faq.ctaWaitlist") : t("faq.ctaQuote"))
            }
          />
        </div>
      </Container>
    </Reveal>
  );
}
