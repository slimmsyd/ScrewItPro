"use client";

import { ExternalLink } from "lucide-react";
import Container from "@/components/ui/Container";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLocale } from "@/components/providers/LocaleProvider";

type Retailer = {
  name: string;
  logo: string;
  /** Soft tile fill behind the logo (Lugg-style app icon) */
  tile: string;
};

const RETAILERS: Retailer[] = [
  { name: "IKEA", logo: "/assets/retailers/ikea.svg", tile: "#FFDB00" },
  { name: "Wayfair", logo: "/assets/retailers/wayfair.png", tile: "#F0F2F7" },
  { name: "Amazon", logo: "/assets/retailers/amazon.svg", tile: "#FFF3E0" },
  { name: "Target", logo: "/assets/retailers/target.svg", tile: "#FDECEA" },
  { name: "Walmart", logo: "/assets/retailers/walmart.svg", tile: "#E8F4FF" },
  { name: "Costco", logo: "/assets/retailers/costco.png", tile: "#EEF2F8" },
  { name: "Ashley", logo: "/assets/retailers/ashley.png", tile: "#F0F2F7" },
  {
    name: "Crate & Barrel",
    logo: "/assets/retailers/crate-and-barrel.png",
    tile: "#F4F1EC",
  },
];

/**
 * Lugg-style rating row adapted for retailers:
 * rounded app-icon tile + bold name + muted subline, spaced with soft link separators.
 * Infinite left marquee; track duplicated for a seamless loop.
 */
export default function DividerBand() {
  const mobile = useIsMobile();
  const { t } = useLocale();
  const sequence = [...RETAILERS, ...RETAILERS];

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
            const dup = i >= RETAILERS.length;
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
        {RETAILERS.map((r) => (
          <li key={r.name}>
            {r.name} — {t("divider.itemSub")}
          </li>
        ))}
      </ul>
    </section>
  );
}
