"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  QUOTE_ITEMS_PATH,
  QUOTE_PATH,
  QUOTE_PRICE_PATH,
} from "@/lib/site";

const STEPS = [
  { key: "where", label: "Where", href: QUOTE_PATH },
  { key: "items", label: "What", href: QUOTE_ITEMS_PATH },
  { key: "price", label: "Price", href: QUOTE_PRICE_PATH },
] as const;

export type QuoteStepIndex = 0 | 1 | 2;

export default function QuoteStepper({
  step,
  allowJumpTo,
}: {
  step: QuoteStepIndex;
  /** Max completed step index the user may jump back to */
  allowJumpTo?: number;
}) {
  const mobile = useIsMobile();
  const maxJump = allowJumpTo ?? step;

  return (
    <nav aria-label="Quote progress" style={{ display: "flex", alignItems: "center" }}>
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        const clickable = i <= maxJump && i !== step;
        const circle = (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 800,
              background:
                done || active ? "var(--blue-electric)" : "var(--gray-100)",
              color: done || active ? "#fff" : "var(--ink-300)",
              flex: "0 0 auto",
            }}
          >
            {done ? <Check size={13} color="#fff" strokeWidth={3} /> : i + 1}
          </div>
        );

        const content = (
          <>
            {circle}
            {!mobile && (
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 600,
                  color: active
                    ? "var(--blue-deep)"
                    : done
                      ? "var(--blue-steel)"
                      : "var(--ink-300)",
                }}
              >
                {s.label}
              </span>
            )}
          </>
        );

        return (
          <div key={s.key} style={{ display: "flex", alignItems: "center" }}>
            {clickable ? (
              <Link
                href={s.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                {content}
              </Link>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: 8 }}
                aria-current={active ? "step" : undefined}
              >
                {content}
              </div>
            )}
            {i < STEPS.length - 1 && (
              <div
                aria-hidden
                style={{
                  width: mobile ? 20 : 44,
                  height: 2,
                  margin: mobile ? "0 6px" : "0 12px",
                  background: i < step ? "var(--blue-electric)" : "var(--gray-100)",
                }}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
