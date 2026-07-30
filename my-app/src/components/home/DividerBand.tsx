"use client";

import { ExternalLink } from "lucide-react";
import Container from "@/components/ui/Container";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";
import { SUPPORTED_RETAILERS } from "@/lib/quote/retailers";

/**
 * Lugg-style rating row adapted for retailers:
 * rounded app-icon tile + bold name + muted subline, spaced with soft link separators.
 * Infinite left marquee; track duplicated for a seamless loop.
 */
export default function DividerBand() {
  const mobile = useIsMobile();
  const { t } = useLocale();
  const sequence = [...SUPPORTED_RETAILERS, ...SUPPORTED_RETAILERS];

  return (
    <section
      aria-label={t("divider.label")}
      style={{
        background: "var(--white)",
        padding: mobile ? "32px 0 36px" : "44px 0 52px",
        overflow: "hidden",
      }}
    >
      <Container>
        <span
          style={{
            display: "block",
            fontFamily: "var(--font-body)",
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: "var(--tracking-caps)",
            textTransform: "uppercase",
            color: "var(--ink-300)",
            marginBottom: mobile ? 20 : 28,
          }}
        >
          {t("divider.label")}
        </span>
      </Container>

      <div className="retailer-marquee" role="presentation">
        <div className="retailer-track">
          {sequence.map((r, i) => {
            const dup = i >= SUPPORTED_RETAILERS.length;
            return (
              <div
                key={`${r.name}-${i}`}
                className="retailer-item"
                aria-hidden={dup || undefined}
              >
                <div
                  className="retailer-tile"
                  style={{ background: r.tile }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={r.logo}
                    alt=""
                    className="retailer-logo"
                    draggable={false}
                  />
                </div>
                <div className="retailer-copy">
                  <span className="retailer-name">{r.name}</span>
                  <span className="retailer-sub">{t("divider.itemSub")}</span>
                </div>
                {/* Soft separator like Lugg's external-link marks */}
                <span className="retailer-sep" aria-hidden>
                  <ExternalLink size={14} strokeWidth={1.75} />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ul className="sr-only">
        {SUPPORTED_RETAILERS.map((r) => (
          <li key={r.name}>
            {r.name} - {t("divider.itemSub")}
          </li>
        ))}
      </ul>
    </section>
  );
}
