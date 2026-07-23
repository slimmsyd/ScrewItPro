import Link from "next/link";
import type { CSSProperties } from "react";
import { Archive, ArrowRight, Check, Package } from "lucide-react";
import type { MockOrder } from "@/lib/orders";
import { formatCents, itemCountLabel } from "@/lib/orders";

const glassCard: CSSProperties = {
  background: "rgba(255, 255, 255, 0.65)",
  border: "1px solid rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(18px) saturate(160%)",
  WebkitBackdropFilter: "blur(18px) saturate(160%)",
  boxShadow:
    "0 20px 44px -22px rgba(4, 32, 155, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
};

const nestedGlass: CSSProperties = {
  background: "rgba(255, 255, 255, 0.55)",
  border: "1px solid rgba(255, 255, 255, 0.85)",
};

export default function ConfirmationPanel({
  order,
  isDemo = false,
}: {
  order: MockOrder;
  /** True when continued past soft-gate without Stripe deposit. */
  isDemo?: boolean;
}) {
  const primary = order.items[0];
  const totalQty = order.items.reduce((n, i) => n + i.quantity, 0);
  const trackHref = `/orders/${order.id}/track${isDemo ? "?demo=1" : ""}`;

  return (
    <div
      className="screen-anim"
      style={{
        flex: 1,
        minHeight: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px 56px",
        background:
          "linear-gradient(170deg, #F3F7FF 0%, #E9F0FE 60%, #E1EAFC 100%)",
        overflow: "hidden",
      }}
    >
      {isDemo && (
        <div
          role="status"
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: 540,
            marginBottom: 14,
            padding: "10px 14px",
            borderRadius: 12,
            background: "rgba(255, 248, 230, 0.95)",
            border: "1px solid rgba(185, 106, 0, 0.25)",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            lineHeight: 1.45,
            color: "var(--ink-700)",
            textAlign: "left",
            boxSizing: "border-box",
          }}
        >
          <strong style={{ color: "var(--status-warning)" }}>Demo path.</strong>{" "}
          No deposit was charged. Stripe keys still need to be wired before
          real Book my build checkout goes live.
        </div>
      )}
      {/* Soft glow orbs */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -40,
          right: "12%",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(29, 110, 254, 0.20)",
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: -20,
          left: "10%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(94, 203, 126, 0.16)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          ...glassCard,
          position: "relative",
          width: "100%",
          maxWidth: 540,
          borderRadius: 26,
          padding: "36px 34px 34px",
          textAlign: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Success badge */}
        <div
          style={{
            width: 84,
            height: 84,
            margin: "0 auto 18px",
            borderRadius: 999,
            background: "rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.95)",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 10px 26px rgba(22, 163, 74, 0.18)",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "var(--status-success)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 10px 26px rgba(22, 163, 74, 0.4)",
            }}
          >
            <Check size={28} color="#fff" strokeWidth={2.8} />
          </div>
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 38,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--blue-deep)",
            lineHeight: 1.1,
          }}
        >
          You&apos;re booked!
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            fontFamily: "var(--font-body)",
            fontSize: 14.5,
            color: "var(--ink-500)",
          }}
        >
          Confirmation sent to {order.email}
        </p>

        {/* Order card */}
        <div
          style={{
            ...nestedGlass,
            marginTop: 24,
            borderRadius: 18,
            padding: "18px 18px 16px",
            textAlign: "left",
            boxShadow: "0 10px 28px -18px rgba(4, 32, 155, 0.22)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--ink-300)",
                }}
              >
                Order
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 800,
                  color: "var(--blue-deep)",
                  letterSpacing: "-0.01em",
                  marginTop: 2,
                }}
              >
                #{order.id}
              </div>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--status-success)",
                background: "var(--status-success-bg)",
                border: "1px solid rgba(22, 163, 74, 0.2)",
                borderRadius: 999,
                padding: "6px 13px",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: "var(--status-success)",
                }}
              />
              Booked
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 12px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.55)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              marginBottom: 14,
            }}
          >
            <div
              aria-hidden
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--blue-50)",
                display: "grid",
                placeItems: "center",
                flex: "0 0 40px",
              }}
            >
              <Archive size={18} color="var(--blue-electric)" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 14.5,
                  fontWeight: 700,
                  color: "var(--blue-deep)",
                }}
              >
                {primary?.name ?? "Your build"}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  color: "var(--ink-500)",
                  marginTop: 2,
                }}
              >
                {itemCountLabel(totalQty)}
                {primary?.fulfillmentLabel
                  ? ` · ${primary.fulfillmentLabel}`
                  : ""}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              paddingTop: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                color: "var(--ink-500)",
              }}
            >
              Paid today · 30% deposit
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--blue-deep)",
                letterSpacing: "-0.02em",
              }}
            >
              {formatCents(order.depositCents)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              marginTop: 8,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                color: "var(--ink-500)",
              }}
            >
              Balance on delivery
            </span>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14.5,
                fontWeight: 700,
                color: "var(--ink-700)",
              }}
            >
              {formatCents(order.balanceCents)}
            </span>
          </div>
        </div>

        {/* Next step strip */}
        <div
          style={{
            ...nestedGlass,
            marginTop: 14,
            borderRadius: 14,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            textAlign: "left",
          }}
        >
          <div
            aria-hidden
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "var(--blue-50)",
              display: "grid",
              placeItems: "center",
              flex: "0 0 40px",
            }}
          >
            <Package size={18} color="var(--blue-electric)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--blue-electric)",
              }}
            >
              Your next step
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14.5,
                fontWeight: 700,
                color: "var(--blue-deep)",
                marginTop: 2,
              }}
            >
              {order.nextStep.title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--ink-500)",
                marginTop: 2,
              }}
            >
              {order.nextStep.body}
            </div>
          </div>
        </div>

        <Link
          href={trackHref}
          style={{
            marginTop: 22,
            height: 52,
            width: "100%",
            borderRadius: 14,
            background: "var(--blue-deep)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 15.5,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            boxShadow: "0 8px 20px -8px rgba(4, 32, 155, 0.5)",
            boxSizing: "border-box",
          }}
        >
          Track my order
          <ArrowRight size={17} color="#fff" />
        </Link>

        <Link
          href={trackHref}
          style={{
            display: "inline-block",
            marginTop: 14,
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--blue-electric)",
            textDecoration: "none",
          }}
        >
          View order details
        </Link>
      </div>
    </div>
  );
}
