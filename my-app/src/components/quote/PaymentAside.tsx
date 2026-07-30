"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { formatUsd } from "@/lib/quote/pricing";
import type { QuoteTotals } from "@/lib/quote/types";
import { useMotionMode } from "@/hooks/useMotionMode";

/** Matches computeDepositCents (30% of total) — single source for ring + label. */
const DEPOSIT_PERCENT = 30;
/** Full motion fill duration. */
const FILL_MS = 1600;
/** Still a one-shot reveal under prefers-reduced-motion (shorter, not infinite). */
const FILL_MS_SOFT = 900;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function PaymentAside({
  totals,
  cta,
  ctaDisabled,
  ctaBusy,
  onCta,
  subcaption,
}: {
  totals: QuoteTotals;
  cta: string;
  ctaDisabled?: boolean;
  ctaBusy?: boolean;
  onCta: () => void;
  subcaption?: string;
}) {
  const motion = useMotionMode();
  /** Animated fill 0 → DEPOSIT_PERCENT when the Price rail mounts. */
  const [fillPct, setFillPct] = useState(0);

  useEffect(() => {
    /**
     * useMotionMode ladder:
     *  - "static" = pre-hydration (do not snap to 30% — that killed the sweep)
     *  - "full" / "soft" = client knows preference → run one-shot fill
     *
     * Previous bug: anything !== "full" immediately set 30% and returned.
     * This Mac has OS Reduce Motion on → mode stayed "soft" → no animation ever.
     */
    if (motion === "static") return;

    const duration = motion === "soft" ? FILL_MS_SOFT : FILL_MS;
    let raf = 0;
    let cancelled = false;
    let start: number | null = null;

    setFillPct(0);

    const tick = (now: number) => {
      if (cancelled) return;
      if (start == null) start = now;
      const t = Math.min(1, (now - start) / duration);
      setFillPct(easeOutCubic(t) * DEPOSIT_PERCENT);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setFillPct(DEPOSIT_PERCENT);
      }
    };

    // Double-rAF: wait one frame so the 0% paint commits before sweeping.
    raf = requestAnimationFrame(() => {
      if (cancelled) return;
      raf = requestAnimationFrame(tick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [motion]);

  const displayPct = Math.round(fillPct);
  const rows = [
    { label: "Deposit", cents: totals.depositCents, emphasize: false },
    { label: "Balance on delivery", cents: totals.balanceCents, emphasize: false },
    { label: "Total", cents: totals.subtotalCents, emphasize: true },
  ];

  return (
    <aside
      style={{
        width: "100%",
        height: "100%",
        maxHeight: "100%",
        flex: "1 1 auto",
        borderLeft: "1px solid var(--border-default)",
        background: "#fff",
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
          marginBottom: 20,
        }}
      >
        Payment
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
        <div
          role="img"
          aria-label={`${DEPOSIT_PERCENT} percent deposit due today`}
          style={{
            width: 58,
            height: 58,
            borderRadius: 999,
            background: `conic-gradient(var(--blue-electric) 0% ${fillPct}%, var(--gray-100) ${fillPct}% 100%)`,
            display: "grid",
            placeItems: "center",
            flex: "0 0 auto",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "#fff",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 800,
              color: "var(--blue-deep)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {displayPct}%
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--ink-500)",
              marginBottom: 2,
            }}
          >
            Due today
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 40,
              letterSpacing: "-0.02em",
              color: "var(--blue-deep)",
              lineHeight: 1,
            }}
          >
            {formatUsd(totals.depositCents)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              fontFamily: "var(--font-body)",
              fontSize: row.emphasize ? 15 : 14,
              fontWeight: row.emphasize ? 700 : 500,
              color: row.emphasize ? "var(--blue-deep)" : "var(--ink-700)",
            }}
          >
            <span style={{ flex: "0 0 auto" }}>{row.label}</span>
            <span
              aria-hidden
              style={{
                flex: 1,
                borderBottom: "1.5px dotted var(--border-default)",
                minWidth: 12,
                transform: "translateY(-4px)",
              }}
            />
            <span
              style={{
                flex: "0 0 auto",
                fontWeight: 700,
                color: row.emphasize ? "var(--blue-deep)" : "var(--ink-900)",
              }}
            >
              {formatUsd(row.cents)}
            </span>
          </div>
        ))}
      </div>

      <p
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          marginTop: 20,
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--ink-500)",
          lineHeight: 1.45,
        }}
      >
        <Lock size={14} style={{ marginTop: 2, flex: "0 0 auto" }} color="var(--ink-300)" />
        You only pay the balance once it&apos;s built and delivered.
      </p>

      <div
        style={{
          marginTop: "auto",
          paddingTop: 24,
          flex: "0 0 auto",
        }}
      >
        <button
          type="button"
          onClick={onCta}
          disabled={ctaDisabled || ctaBusy}
          style={{
            width: "100%",
            height: 52,
            borderRadius: 9,
            border: "none",
            cursor: ctaDisabled || ctaBusy ? "not-allowed" : "pointer",
            opacity: ctaDisabled || ctaBusy ? 0.55 : 1,
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 15.5,
            color: "#fff",
            background: "var(--blue-electric)",
            boxShadow: "0 8px 20px -8px rgba(4,32,155,.5)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
          }}
        >
          {ctaBusy ? "Starting checkout…" : cta}
          {!ctaBusy && <span aria-hidden>→</span>}
        </button>
        {subcaption && (
          <p
            style={{
              marginTop: 12,
              textAlign: "center",
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              color: "var(--ink-500)",
            }}
          >
            {subcaption}
          </p>
        )}
      </div>
    </aside>
  );
}
