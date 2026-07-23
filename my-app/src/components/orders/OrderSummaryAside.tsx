import { Archive, Mail } from "lucide-react";
import type { MockOrder } from "@/lib/orders";
import { formatCents, itemCountLabel } from "@/lib/orders";

const SUPPORT_MAIL = "hello@screwitpros.com";

export default function OrderSummaryAside({ order }: { order: MockOrder }) {
  const primary = order.items[0];
  const totalQty = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <aside
      style={{
        width: "100%",
        height: "100%",
        background: "var(--gray-50)",
        borderLeft: "1px solid var(--border-default)",
        padding: "28px 24px 32px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink-300)",
          marginBottom: 14,
        }}
      >
        Order summary
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border-default)",
          borderRadius: 14,
          padding: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          aria-hidden
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--blue-50)",
            display: "grid",
            placeItems: "center",
            flex: "0 0 44px",
          }}
        >
          <Archive size={20} color="var(--blue-electric)" strokeWidth={2} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14.5,
              fontWeight: 700,
              color: "var(--blue-deep)",
              lineHeight: 1.3,
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
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border-default)",
          borderRadius: 14,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <FactRow label="Deposit paid" value={formatCents(order.depositCents)} />
        <FactRow label="Balance due" value={formatCents(order.balanceCents)} />
        <FactRow label="Delivering to" value={order.deliveryLine} />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "4px 2px 18px",
        }}
      >
        <Mail
          size={16}
          color="var(--ink-500)"
          strokeWidth={2}
          style={{ marginTop: 2, flex: "0 0 auto" }}
        />
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-body)",
            fontSize: 13,
            lineHeight: 1.45,
            color: "var(--ink-500)",
          }}
        >
          We email you at every status change
        </p>
      </div>

      <a
        href={`mailto:${SUPPORT_MAIL}`}
        style={{
          marginTop: "auto",
          height: 44,
          borderRadius: 12,
          border: "1.5px solid var(--border-default)",
          background: "#fff",
          color: "var(--blue-deep)",
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Contact support
      </a>
    </aside>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "baseline",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13.5,
          color: "var(--ink-500)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13.5,
          fontWeight: 700,
          color: "var(--blue-deep)",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
