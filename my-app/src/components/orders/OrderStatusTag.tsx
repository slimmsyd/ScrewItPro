import type { CustomerOrderStatus } from "@/lib/orders";
import { ORDER_STATUS_META } from "@/lib/orders";

/**
 * Style 2 status tag: blue gradient pill + pulsing white live dot.
 * Design handoff recommendation for in-progress orders.
 */
export default function OrderStatusTag({
  status,
}: {
  status: CustomerOrderStatus;
}) {
  const { label } = ORDER_STATUS_META[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 34,
        padding: "0 14px",
        borderRadius: 999,
        background:
          "linear-gradient(90deg, var(--blue-deep), var(--blue-electric))",
        color: "#fff",
        fontFamily: "var(--font-body)",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        boxShadow: "0 8px 18px -8px rgba(29, 110, 254, 0.7)",
        whiteSpace: "nowrap",
      }}
    >
      <span
        className="pulse-dot"
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: "#fff",
          flex: "0 0 auto",
        }}
      />
      {label}
    </span>
  );
}
