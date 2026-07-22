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
        Your build{items.length > 0 ? ` (${items.length})` : ""}
      </div>

      {items.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            textAlign: "center",
            padding: "28px 20px",
            color: "var(--ink-500)",
            background: "#fff",
            border: "1px dashed var(--border-default)",
            borderRadius: 11,
          }}
        >
          <PackageOpen size={26} strokeWidth={1.5} color="var(--ink-300)" />
          <p style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.5, maxWidth: 200 }}>
            Add items to start your build.
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
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  gap: 11,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: "var(--gray-50)",
                    border: "1px solid var(--border-default)",
                    display: "grid",
                    placeItems: "center",
                    flex: "0 0 38px",
                  }}
                >
                  <Icon size={18} color="var(--blue-steel)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "var(--blue-deep)",
                      lineHeight: 1.3,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.brand ? `${item.brand} ` : ""}
                    {item.name}
                    {(item.quantity ?? 1) > 1 ? ` ×${item.quantity}` : ""}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <SrcTag src={item.src} articleId={item.articleId} />
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
                    padding: 5,
                    color: "var(--ink-300)",
                    display: "flex",
                  }}
                >
                  <X size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ marginTop: "auto", paddingTop: 16 }}>
        {/* Price stays hidden until the Price step (handoff). */}
        <p
          style={{
            margin: "0 0 14px",
            fontFamily: "var(--font-body)",
            fontSize: 12.5,
            color: "var(--ink-500)",
            lineHeight: 1.5,
          }}
        >
          Your full, itemized price appears on the next step — before any
          account.
        </p>
        <button
          type="button"
          onClick={onCta}
          disabled={ctaDisabled}
          className="quote-tap"
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
