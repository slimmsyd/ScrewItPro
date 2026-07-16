"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { locales, type Locale } from "@/i18n/config";

export default function MobileMenu({
  open,
  onClose,
  onQuote,
  ctaLabel,
  waitlist,
}: {
  open: boolean;
  onClose: () => void;
  onQuote: () => void;
  ctaLabel?: string;
  waitlist: boolean;
}) {
  const { t, locale, setLocale, labels } = useLocale();
  // Announce strip + nav + buffer - matches LandingPage headerHeight
  const navOffset = 104;
  const startX = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const links = [
    [t("nav.howItWorks"), "#how"],
    [t("nav.services"), "#services"],
    [t("nav.whyUs"), "#why"],
    [t("nav.faq"), "#faq"],
  ] as const;

  const dragging = startX.current !== null;
  const stag = (d: number) =>
    `opacity .3s ease ${open ? d : 0}s, transform .34s cubic-bezier(.16,1,.3,1) ${open ? d : 0}s`;

  return (
    <>
      {/*
        Only mount the dimmer while the menu is open.
        A full-screen fixed layer left at opacity:0 still promotes a GPU layer on
        iOS Safari and greys the whole page (banner vs body become one wash).
      */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11,16,48,0.34)",
            zIndex: 800,
          }}
        />
      )}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!open}
        onPointerDown={(e) => {
          startX.current = e.clientX;
        }}
        onPointerMove={(e) => {
          if (startX.current != null)
            setDrag(Math.max(0, e.clientX - startX.current));
        }}
        onPointerUp={(e) => {
          if (startX.current != null) {
            const dx = e.clientX - startX.current;
            startX.current = null;
            if (dx > 60) onClose();
            setDrag(0);
          }
        }}
        onPointerCancel={() => {
          startX.current = null;
          setDrag(0);
        }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "86%",
          maxWidth: 360,
          background: "var(--white)",
          borderRadius: "24px 0 0 24px",
          boxShadow: "-12px 0 44px rgba(4,32,155,0.18)",
          zIndex: 850,
          transform: open ? `translateX(${drag}px)` : "translateX(100%)",
          // Keep off-screen drawer from participating in hit-testing / compositing
          visibility: open || drag > 0 ? "visible" : "hidden",
          transition: dragging
            ? "none"
            : "transform .34s cubic-bezier(.16,1,.3,1)",
          display: "flex",
          flexDirection: "column",
          // Top padding +20% so links clear the fixed header strip on mobile
          padding: `${Math.round((navOffset + 18) * 1.2)}px 26px 28px`,
          touchAction: "pan-y",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {links.map(([l, h], i) => (
          <a
            key={h}
            href={h}
            onClick={onClose}
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: 27,
              letterSpacing: "var(--tracking-display)",
              color: "var(--text-heading)",
              textDecoration: "none",
              padding: "13px 0",
              opacity: open ? 1 : 0,
              transform: open ? "none" : "translateX(18px)",
              transition: stag(0.08 + i * 0.045),
              cursor: "pointer",
            }}
          >
            {l}
          </a>
        ))}
        <button
          type="button"
          onClick={() => {
            onClose();
            onQuote();
          }}
          style={{
            marginTop: 22,
            height: 54,
            borderRadius: "var(--radius-pill)",
            border: "none",
            background: "var(--blue-deep)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            opacity: open ? 1 : 0,
            transform: open ? "none" : "translateX(18px)",
            transition: stag(0.28),
          }}
        >
          {ctaLabel ??
            (waitlist ? t("common.joinNow") : t("common.getQuote"))}
        </button>
        <div
          style={{
            marginTop: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderTop: "1px solid var(--gray-100)",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            fontWeight: 500,
            color: "var(--ink-700)",
            opacity: open ? 1 : 0,
            transition: stag(0.32),
          }}
        >
          <span>{t("common.language")}</span>
          <div style={{ display: "flex", gap: 8 }}>
            {locales.map((code: Locale) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                style={{
                  border: "none",
                  background: code === locale ? "var(--blue-50)" : "transparent",
                  color:
                    code === locale ? "var(--blue-deep)" : "var(--ink-500)",
                  fontWeight: code === locale ? 600 : 500,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  padding: "6px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {labels[code]}
              </button>
            ))}
          </div>
        </div>
        <div
          style={{
            marginTop: "auto",
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 19,
            letterSpacing: "var(--tracking-display)",
            color: "var(--blue-electric)",
            opacity: open ? 1 : 0,
            transition: stag(0.36),
          }}
        >
          {t("nav.tagline")}
        </div>
      </aside>
    </>
  );
}
