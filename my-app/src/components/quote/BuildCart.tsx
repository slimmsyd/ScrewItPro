"use client";

import type { CSSProperties } from "react";
import {
  Archive,
  Armchair,
  BedDouble,
  Home,
  Library,
  PackageOpen,
  Store,
  Table,
  Tag,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatUsd } from "@/lib/quote/pricing";
import type { ItemSource, QuoteItem } from "@/lib/quote/types";

const ICONS: Record<string, LucideIcon> = {
  archive: Archive,
  armchair: Armchair,
  "bed-double": BedDouble,
  library: Library,
  table: Table,
  bed: BedDouble,
  dresser: Archive,
  shelf: Library,
  chair: Armchair,
  other: PackageOpen,
  sofa: PackageOpen,
  "door-open": PackageOpen,
  store: Store,
};

function SrcTag({ src, articleId }: { src: ItemSource; articleId?: string }) {
  if (src === "hub") {
    return (
      <span style={tagStyle}>
        <Tag size={12} /> Art. #{articleId ?? "—"}
      </span>
    );
  }
  if (src === "home") {
    return (
      <span style={tagStyle}>
        <Home size={12} /> Pickup from home
      </span>
    );
  }
  return (
    <span style={tagStyle}>
      <Store size={12} /> Store pickup
    </span>
  );
}

const tagStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: 11.5,
  fontWeight: 600,
  color: "var(--ink-500)",
  background: "var(--gray-50)",
  borderRadius: 999,
  padding: "3px 8px",
};

export default function BuildCart({
  items,
  onRemove,
  cta,
  ctaDisabled,
  onCta,
}: {
  items: QuoteItem[];
  onRemove: (id: string) => void;
  cta: string;
  ctaDisabled?: boolean;
  onCta: () => void;
}) {
  return (
    <aside
      className="quote-aside-desktop"
      style={{
        width: "100%",
        flex: 1,
        borderLeft: "1px solid var(--border-default)",
        background: "var(--gray-50)",
        padding: "28px 26px",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--ink-300)",
          marginBottom: 16,
        }}
      >
        Your build
      </div>

      {items.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px 8px",
            color: "var(--ink-300)",
          }}
        >
          <PackageOpen size={36} strokeWidth={1.5} />
          <p style={{ marginTop: 12, fontSize: 13.5, lineHeight: 1.45, maxWidth: 200 }}>
            Add furniture on the left. Your build list appears here.
          </p>
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflowY: "auto",
            flex: 1,
          }}
        >
          {items.map((item) => {
            const Icon = ICONS[item.icon] ?? PackageOpen;
            return (
              <li
                key={item.id}
                style={{
                  background: "#fff",
                  border: "1px solid var(--border-default)",
                  borderRadius: 11,
                  padding: 12,
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "var(--blue-50)",
                    display: "grid",
                    placeItems: "center",
                    flex: "0 0 auto",
                  }}
                >
                  <Icon size={18} color="var(--blue-electric)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.brand && (
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        color: "var(--ink-300)",
                      }}
                    >
                      {item.brand}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: "var(--ink-900)",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.name}
                    {(item.quantity ?? 1) > 1 ? ` ×${item.quantity}` : ""}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <SrcTag src={item.src} articleId={item.articleId} />
                  </div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--blue-deep)",
                    }}
                  >
                    {formatUsd(item.assemblyCents * (item.quantity ?? 1))}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => onRemove(item.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 4,
                    color: "var(--ink-300)",
                  }}
                >
                  <X size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ marginTop: "auto", paddingTop: 20 }}>
        <button
          type="button"
          onClick={onCta}
          disabled={ctaDisabled}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 9,
            border: "none",
            cursor: ctaDisabled ? "not-allowed" : "pointer",
            opacity: ctaDisabled ? 0.5 : 1,
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 15.5,
            color: "#fff",
            background: "var(--blue-deep)",
            boxShadow: ctaDisabled ? "none" : "0 8px 20px -8px rgba(4,32,155,.5)",
          }}
        >
          {cta} →
        </button>
      </div>
    </aside>
  );
}
