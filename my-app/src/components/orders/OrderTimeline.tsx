"use client";

import {
  CalendarCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  PartyPopper,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { CustomerOrderStatus } from "@/lib/orders";
import {
  ORDER_STATUS_META,
  ORDER_STATUS_ORDER,
  formatUpdatedAgo,
  nodeStateFor,
} from "@/lib/orders";

const ICONS: Record<string, LucideIcon> = {
  CheckCircle2,
  CalendarCheck,
  PackageCheck,
  Wrench,
  ClipboardCheck,
  Truck,
  PartyPopper,
};

export default function OrderTimeline({
  current,
  statusUpdatedAt,
}: {
  current: CustomerOrderStatus;
  statusUpdatedAt: string;
}) {
  const updated = formatUpdatedAgo(statusUpdatedAt);

  return (
    <ol
      style={{
        listStyle: "none",
        margin: "28px 0 0",
        padding: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {ORDER_STATUS_ORDER.map((step, i) => {
        const state = nodeStateFor(step, current);
        const meta = ORDER_STATUS_META[step];
        const Icon = ICONS[meta.icon] ?? CheckCircle2;
        const isLast = i === ORDER_STATUS_ORDER.length - 1;

        return (
          <li
            key={step}
            style={{
              display: "flex",
              gap: 16,
              position: "relative",
              minHeight: isLast ? undefined : 64,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 34,
                flex: "0 0 34px",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  flex: "0 0 34px",
                  ...(state === "done"
                    ? {
                        background: "var(--blue-electric)",
                        border: "none",
                      }
                    : state === "active"
                      ? {
                          background: "#fff",
                          border: "2px solid var(--blue-electric)",
                        }
                      : {
                          background: "var(--gray-50)",
                          border: "1.5px solid var(--gray-100)",
                        }),
                }}
              >
                {state === "done" ? (
                  <Check size={16} color="#fff" strokeWidth={2.8} />
                ) : (
                  <Icon
                    size={15}
                    color={
                      state === "active"
                        ? "var(--blue-electric)"
                        : "var(--ink-300)"
                    }
                    strokeWidth={2.2}
                  />
                )}
              </div>
              {!isLast && (
                <div
                  aria-hidden
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 22,
                    marginTop: 4,
                    background:
                      state === "done"
                        ? "var(--blue-electric)"
                        : "var(--gray-100)",
                    borderRadius: 1,
                  }}
                />
              )}
            </div>

            <div style={{ paddingBottom: isLast ? 0 : 18, minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15.5,
                  fontWeight: state === "active" ? 800 : state === "done" ? 700 : 600,
                  color:
                    state === "upcoming"
                      ? "var(--ink-300)"
                      : "var(--blue-deep)",
                  lineHeight: 1.25,
                }}
              >
                {meta.label}
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontFamily: "var(--font-body)",
                  fontSize: 13.5,
                  color:
                    state === "upcoming"
                      ? "var(--ink-300)"
                      : "var(--ink-500)",
                  lineHeight: 1.4,
                }}
              >
                {meta.description}
              </div>
              {state === "active" && (
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--blue-electric)",
                  }}
                >
                  In progress · updated {updated}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
