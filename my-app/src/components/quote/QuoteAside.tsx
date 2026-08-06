"use client";

import { ShieldCheck } from "lucide-react";
import { formatUsd } from "@/lib/quote/pricing";
import type { QuoteTotals } from "@/lib/quote/types";

export default function QuoteAside({
  totals,
  showPrice,
  pickupMode,
  hint,
  cta,
  ctaDisabled,
  onCta,
  accentCta,
}: {
  totals: QuoteTotals;
  showPrice: boolean;
  pickupMode: "ship" | "pickup";
  hint?: string;
  cta: string;
  ctaDisabled?: boolean;
  onCta: () => void;
  accentCta?: boolean;
}) {
  const rows: { label: string; cents: number }[] = [
    {
      label: `Assembly · ${totals.itemCount || 1} item${totals.itemCount === 1 ? "" : "s"}`,
      cents: totals.assemblyCents,
    },
  ];
  if (pickupMode === "pickup") {
    rows.push({ label: "Pickup · Houston Metro", cents: totals.pickupCents });
  }
  rows.push({
    label: "Delivery · assembled & placed",
    cents: totals.deliveryCents,
  });
  if (totals.travelCents > 0) {
    rows.push({
      label: "Travel · out of area",
      cents: totals.travelCents,
    });
  }

  return (
    <aside
      className="quote-aside-desktop"
      style={{
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        flex: "1 1 auto",
        borderLeft: "1px solid var(--border-default)",
        background: "var(--gray-50)",
        padding: "28px 26px",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        boxSizing: "border-box",
        overflow: "hidden",
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
        Your quote
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border-default)",
          borderRadius: 11,
          padding: "6px 18px",
        }}
      >
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "13px 0",
              borderBottom:
                i < rows.length - 1 ? "1px solid var(--gray-100)" : "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                color: showPrice ? "var(--ink-700)" : "var(--ink-300)",
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                fontWeight: 700,
                color: showPrice ? "var(--ink-900)" : "var(--ink-300)",
              }}
            >
              {showPrice ? formatUsd(row.cents) : "-"}
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          padding: "16px 4px 4px",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink-500)",
          }}
        >
          Subtotal
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            letterSpacing: "-0.02em",
            color: showPrice ? "var(--blue-deep)" : "var(--ink-300)",
          }}
        >
          {showPrice ? formatUsd(totals.subtotalCents) : "$-"}
        </span>
      </div>
      {showPrice ? (
        <div
          style={{
            marginTop: 6,
            background: "var(--blue-50)",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--blue-deep)",
            }}
          >
            Deposit today (30%)
          </span>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 800,
              color: "var(--blue-deep)",
            }}
          >
            {formatUsd(totals.depositCents)}
          </span>
        </div>
      ) : (
        <p
          style={{
            marginTop: 6,
            fontFamily: "var(--font-body)",
            fontSize: 12.5,
            color: "var(--ink-500)",
            lineHeight: 1.5,
          }}
        >
          {hint ??
            "Your full price appears the moment we know what to build, before any account."}
        </p>
      )}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 20,
          flex: "0 0 auto",
        }}
      >
        <button
          type="button"
          onClick={onCta}
          disabled={ctaDisabled}
          className="quote-primary-btn"
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
            letterSpacing: "-0.01em",
            color: "#fff",
            background: accentCta ? "var(--blue-electric)" : "var(--blue-deep)",
            boxShadow: ctaDisabled
              ? "none"
              : "0 8px 20px -8px rgba(4,32,155,.5)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
          }}
        >
          {cta}
          <span aria-hidden>→</span>
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            marginTop: 12,
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: "var(--ink-500)",
          }}
        >
          <ShieldCheck size={14} color="var(--status-success)" />
          No hidden fees · Cancel free anytime
        </div>
      </div>
    </aside>
  );
}
