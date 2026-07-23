"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Home,
  Package,
  Sparkles,
  Truck,
} from "lucide-react";
import QuoteShell from "@/components/quote/QuoteShell";
import PaymentAside from "@/components/quote/PaymentAside";
import ScreenTransition from "@/components/quote/ScreenTransition";
import { useQuote } from "@/lib/quote/context";
import { formatUsd } from "@/lib/quote/pricing";
import { QUOTE_ITEMS_PATH } from "@/lib/site";
import { useIsMobile } from "@/hooks/useIsMobile";

/** Demo post-book confirmation when Stripe deposit checkout is not configured. */
const DEMO_CONFIRMATION_PATH = "/orders/SIP-4471?demo=1";

/**
 * Price step — handoff locked layout:
 * full-bleed gray-50 main, white payment rail 360px,
 * badge-check eyebrow, breakdown card, 30% deposit aside.
 *
 * Stripe: when keys are live, Book my build opens Checkout. When not ready,
 * soft-gate flags that deposit payment still needs wiring and offers
 * Continue so the full post-book UI flow can be tested without Stripe.
 */
export default function PriceStep() {
  const router = useRouter();
  const mobile = useIsMobile();
  const { draft, totals, canProceedFromItems, hydrated } = useQuote();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [softGate, setSoftGate] = useState(false);

  const continueWithoutStripe = () => {
    setSoftGate(false);
    router.push(DEMO_CONFIRMATION_PATH);
  };

  useEffect(() => {
    if (hydrated && !canProceedFromItems) {
      router.replace(QUOTE_ITEMS_PATH);
    }
  }, [hydrated, canProceedFromItems, router]);

  const book = async () => {
    if (!canProceedFromItems || totals.subtotalCents <= 0) {
      router.push(QUOTE_ITEMS_PATH);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const readyRes = await fetch("/api/payments/checkout");
      const readyJson = (await readyRes.json()) as { ready?: boolean };
      if (!readyJson.ready) {
        setSoftGate(true);
        setBusy(false);
        return;
      }

      const description = draft.items
        .map((i) => i.name)
        .slice(0, 3)
        .join(", ");

      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalCents: totals.subtotalCents,
          description: `ScrewIt build: ${description}`,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        url?: string;
        message?: string;
        error?: string;
      };

      if (!res.ok || !json.ok || !json.url) {
        if (json.error === "stripe_not_configured") {
          setSoftGate(true);
        } else {
          setError(json.message ?? "Could not start checkout.");
        }
        setBusy(false);
        return;
      }
      window.location.href = json.url;
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  };

  const lines = [
    {
      icon: Package,
      label: `Assembly · ${totals.itemCount} item${totals.itemCount === 1 ? "" : "s"}`,
      sub: draft.items.map((i) => i.name).join(" · ") || "Furniture assembly",
      cents: totals.assemblyCents,
    },
    ...(draft.pickupMode === "pickup"
      ? [
          {
            icon: Truck,
            label: "Pickup · Houston Metro",
            sub: draft.pickupAddress?.formattedAddress ?? "From your address",
            cents: totals.pickupCents,
          },
        ]
      : [
          {
            icon: Package,
            label: "Inbound · Ship to hub",
            sub: "You ship boxes to our workshop",
            cents: 0,
          },
        ]),
    {
      icon: Home,
      label: "Delivery · assembled & placed",
      sub: draft.deliveryAddress?.formattedAddress ?? "White-glove delivery",
      cents: totals.deliveryCents,
    },
  ];

  const payment = (
    <PaymentAside
      totals={totals}
      cta="Book my build"
      ctaDisabled={!canProceedFromItems}
      ctaBusy={busy}
      onCta={() => void book()}
      subcaption="Create your account at checkout · 30 seconds."
    />
  );

  return (
    <QuoteShell
      step={2}
      aside={payment}
      asideWidth={360}
      /* Full main column is gray-50 (handoff), not a partial content wrap */
      mainBackground="var(--gray-50)"
      mobileBar={
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
              fontFamily: "var(--font-body)",
            }}
          >
            <span
              style={{ fontSize: 13, color: "var(--ink-500)", fontWeight: 600 }}
            >
              Due today (30%)
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                color: "var(--blue-deep)",
              }}
            >
              {formatUsd(totals.depositCents)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void book()}
            disabled={busy || !canProceedFromItems}
            style={{
              width: "100%",
              height: 48,
              borderRadius: 9,
              border: "none",
              background: "var(--blue-electric)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: busy ? "wait" : "pointer",
              opacity: canProceedFromItems ? 1 : 0.5,
            }}
          >
            {busy ? "Starting checkout…" : "Book my build →"}
          </button>
        </div>
      }
    >
      <ScreenTransition>
        {/* Back — block-level so it never sits on the same row as the eyebrow */}
        <Link
          href={QUOTE_ITEMS_PATH}
          style={{
            display: "flex",
            width: "fit-content",
            alignItems: "center",
            gap: 7,
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--ink-500)",
            textDecoration: "none",
            marginBottom: 16,
            fontFamily: "var(--font-body)",
          }}
        >
          <ArrowLeft size={16} color="var(--ink-500)" /> Back
        </Link>

        {/* Handoff: badge-check + INSTANT QUOTE · NO HIDDEN FEES */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <BadgeCheck
            size={17}
            color="var(--status-success)"
            strokeWidth={2.25}
            aria-hidden
          />
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12.5,
              fontWeight: 800,
              color: "var(--status-success)",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
            }}
          >
            Instant quote · No hidden fees
          </span>
        </div>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: mobile ? 30 : 38,
            letterSpacing: "-0.02em",
            color: "var(--blue-deep)",
            margin: "0 0 22px",
            lineHeight: 1.1,
          }}
        >
          Here&apos;s your honest breakdown
        </h1>

        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            border: "1px solid var(--border-default)",
            maxWidth: 600,
            padding: "8px 22px",
          }}
        >
          {lines.map((line, i) => {
            const Icon = line.icon;
            return (
              <div
                key={line.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 0",
                  borderBottom:
                    i < lines.length - 1 ? "1px solid var(--gray-100)" : "none",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: "var(--blue-50)",
                    display: "grid",
                    placeItems: "center",
                    flex: "0 0 42px",
                  }}
                >
                  <Icon size={19} color="var(--blue-electric)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--ink-900)",
                    }}
                  >
                    {line.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12.5,
                      color: "var(--ink-500)",
                      marginTop: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {line.sub}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 15.5,
                    color: "var(--ink-900)",
                    flex: "0 0 auto",
                  }}
                >
                  {line.cents === 0 ? "Free" : formatUsd(line.cents)}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginTop: 16,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--ink-500)",
            maxWidth: 600,
          }}
        >
          <Sparkles
            size={16}
            color="var(--blue-steel)"
            style={{ flex: "0 0 auto" }}
            aria-hidden
          />
          This is the whole price. What you see is what you pay.
        </div>

        {error && (
          <p
            role="alert"
            style={{
              marginTop: 12,
              color: "var(--status-error)",
              fontWeight: 600,
            }}
          >
            {error}
          </p>
        )}

        {mobile && (
          <div style={{ marginTop: 28 }}>
            <PaymentAside
              totals={totals}
              cta="Book my build"
              ctaDisabled={!canProceedFromItems}
              ctaBusy={busy}
              onCta={() => void book()}
              subcaption="Create your account at checkout · 30 seconds."
            />
          </div>
        )}
      </ScreenTransition>

      {softGate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="soft-gate-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(11,16,48,0.45)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => setSoftGate(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              maxWidth: 400,
              width: "100%",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h2
              id="soft-gate-title"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                color: "var(--blue-deep)",
                margin: "0 0 10px",
              }}
            >
              Stripe deposit not wired yet
            </h2>
            <p
              style={{
                margin: "0 0 12px",
                color: "var(--ink-500)",
                lineHeight: 1.5,
                fontSize: 15,
              }}
            >
              Real &quot;Book my build&quot; charges a 30% deposit once Stripe
              keys are configured. That step is still open for production.
            </p>
            <p
              style={{
                margin: "0 0 20px",
                color: "var(--ink-700)",
                lineHeight: 1.5,
                fontSize: 14.5,
                fontWeight: 600,
              }}
            >
              You can still continue into the confirmation and order tracker
              with demo data so the full customer flow is testable now.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                type="button"
                onClick={continueWithoutStripe}
                style={{
                  height: 48,
                  borderRadius: 9,
                  border: "none",
                  background: "var(--blue-electric)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Continue to confirmation →
              </button>
              <button
                type="button"
                onClick={() => setSoftGate(false)}
                style={{
                  height: 44,
                  borderRadius: 9,
                  border: "1px solid var(--border-default)",
                  background: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--ink-700)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Keep editing quote
              </button>
            </div>
          </div>
        </div>
      )}
    </QuoteShell>
  );
}
