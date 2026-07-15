"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * Lead-capture modal used in "quote" site mode. In waitlist mode CTAs route to
 * /join instead, so this stays closed. Submit is a stub (setSent) for now.
 */
export default function QuoteDialog({
  open,
  onClose,
  waitlist,
}: {
  open: boolean;
  onClose: () => void;
  waitlist: boolean;
}) {
  const { t } = useLocale();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title = sent
    ? waitlist
      ? t("quote.titleSentWaitlist")
      : t("quote.titleSentQuote")
    : t("quote.titleForm");

  const services = [
    t("quote.optAssembly"),
    t("quote.optLarge"),
    t("quote.optOffice"),
    t("quote.optPickup"),
    t("quote.optWhiteGlove"),
    t("quote.optMembership"),
  ];

  const labelStyle = {
    display: "block",
    fontFamily: "var(--font-body)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--ink-700)",
    marginBottom: 6,
  } as const;

  const fieldStyle = {
    width: "100%",
    height: 46,
    padding: "0 14px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--gray-200)",
    background: "var(--white)",
    fontFamily: "var(--font-body)",
    fontSize: 15,
    color: "var(--ink-900)",
    outline: "none",
  } as const;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "rgba(11,16,48,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "var(--white)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          padding: 28,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "var(--text-h3)",
              color: "var(--text-heading)",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            type="button"
            aria-label={t("nav.closeMenu")}
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "var(--gray-50)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <X size={18} color="var(--ink-700)" />
          </button>
        </div>

        {sent ? (
          <>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                lineHeight: "var(--leading-body)",
                color: "var(--text-muted)",
                margin: "0 0 24px",
              }}
            >
              {waitlist ? t("quote.sentWaitlist") : t("quote.sentQuote")}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button variant="primary" onClick={onClose}>
                {t("quote.done")}
              </Button>
            </div>
          </>
        ) : (
          <>
            {waitlist && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--blue-50)",
                  border: "1px solid var(--blue-100)",
                  marginBottom: 16,
                }}
              >
                <Sparkles
                  size={18}
                  color="var(--blue-electric)"
                  style={{ flex: "none", marginTop: 1 }}
                />
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: "var(--ink-700)",
                  }}
                >
                  <strong style={{ color: "var(--blue-deep)" }}>
                    {t("quote.bannerStrong")}
                  </strong>
                  {t("quote.bannerText")}
                </div>
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <div>
                <label htmlFor="quote-name" style={labelStyle}>
                  {t("quote.name")}
                </label>
                <input
                  id="quote-name"
                  placeholder={t("quote.namePh")}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label htmlFor="quote-email" style={labelStyle}>
                  {t("quote.email")}
                </label>
                <input
                  id="quote-email"
                  type="email"
                  placeholder={t("quote.emailPh")}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label htmlFor="quote-service" style={labelStyle}>
                  {t("quote.service")}
                </label>
                <select id="quote-service" defaultValue="" style={fieldStyle}>
                  <option value="" disabled>
                    {t("quote.servicePh")}
                  </option>
                  {services.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 24,
              }}
            >
              <Button variant="secondary" onClick={onClose}>
                {t("quote.cancel")}
              </Button>
              <Button variant="primary" onClick={() => setSent(true)}>
                {waitlist ? t("quote.submitWaitlist") : t("quote.submitQuote")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
