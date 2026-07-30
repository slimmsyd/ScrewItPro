"use client";

import Link from "next/link";
import type { MockOrder } from "@/lib/orders";
import { ORDER_STATUS_META } from "@/lib/orders";
import OrderStatusTag from "@/components/orders/OrderStatusTag";
import OrderTimeline from "@/components/orders/OrderTimeline";
import OrderSummaryAside from "@/components/orders/OrderSummaryAside";
import { useDisplayOrder } from "@/components/orders/useDisplayOrder";

/** Client shell so Order Summary can show snapshot imageUrl from quote booking. */
export default function TrackOrderView({ baseOrder }: { baseOrder: MockOrder }) {
  const order = useDisplayOrder(baseOrder);
  const statusCopy = ORDER_STATUS_META[order.status];

  return (
    <div
      className="screen-anim"
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "row",
        background: "#fff",
      }}
    >
      <main
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          overflowY: "auto",
          padding: "28px 24px 48px",
          WebkitOverflowScrolling: "touch",
        }}
        className="order-track-main"
      >
        <Link
          href="/customer/jobs"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--ink-500)",
            textDecoration: "none",
            marginBottom: 18,
          }}
        >
          ← My Jobs
        </Link>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "clamp(24px, 4vw, 30px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "var(--blue-deep)",
              lineHeight: 1.15,
            }}
          >
            Order #{order.id}
          </h1>
          <OrderStatusTag status={order.status} />
        </div>

        <p
          style={{
            margin: "0 0 4px",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--ink-500)",
            lineHeight: 1.45,
          }}
        >
          {statusCopy.description}
        </p>

        <OrderTimeline
          current={order.status}
          statusUpdatedAt={order.statusUpdatedAt}
        />
      </main>

      <div
        className="order-track-aside"
        style={{
          flex: "0 0 340px",
          width: 340,
          maxWidth: 340,
          minHeight: 0,
          alignSelf: "stretch",
        }}
      >
        <OrderSummaryAside order={order} />
      </div>
    </div>
  );
}
