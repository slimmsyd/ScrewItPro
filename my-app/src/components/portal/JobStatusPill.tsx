import {
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  PartyPopper,
  Truck,
  Wrench,
} from "lucide-react";
import type { CustomerOrderStatus } from "@/lib/orders";
import { ORDER_STATUS_META } from "@/lib/orders";

const STATUS_ICONS = {
  CheckCircle2,
  CalendarCheck,
  PackageCheck,
  Wrench,
  ClipboardCheck,
  Truck,
  PartyPopper,
} as const;

/**
 * Portal status pill — design_handoff_portal StatusPill. Subtle tint,
 * green check for delivered; distinct from the tracker's gradient
 * OrderStatusTag.
 */
export default function JobStatusPill({
  status,
  small = false,
}: {
  status: CustomerOrderStatus;
  small?: boolean;
}) {
  const meta = ORDER_STATUS_META[status];
  const delivered = status === "delivered";
  const Icon = delivered ? Check : STATUS_ICONS[meta.icon];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontFamily: "var(--font-body)",
        fontSize: small ? 11.5 : 12.5,
        fontWeight: 700,
        color: delivered ? "var(--status-success)" : "var(--blue-deep)",
        background: delivered
          ? "var(--status-success-bg)"
          : "var(--blue-50)",
        borderRadius: 999,
        padding: small ? "4px 10px" : "5px 12px",
        whiteSpace: "nowrap",
      }}
    >
      <Icon
        size={small ? 12 : 13}
        color={delivered ? "var(--status-success)" : "var(--blue-electric)"}
        strokeWidth={2}
        aria-hidden
        style={{ flex: "0 0 auto" }}
      />
      {meta.label}
    </span>
  );
}
