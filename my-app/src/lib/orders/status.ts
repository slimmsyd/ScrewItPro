import type { CustomerOrderStatus, TimelineNodeState } from "./types";

export const ORDER_STATUS_ORDER: CustomerOrderStatus[] = [
  "booked",
  "pickup_scheduled",
  "picked_up",
  "in_workshop",
  "assembled_inspected",
  "out_for_delivery",
  "delivered",
];

export const ORDER_STATUS_META: Record<
  CustomerOrderStatus,
  {
    label: string;
    description: string;
    /** lucide-react icon name used by the timeline */
    icon:
      | "CheckCircle2"
      | "CalendarCheck"
      | "PackageCheck"
      | "Wrench"
      | "ClipboardCheck"
      | "Truck"
      | "PartyPopper";
  }
> = {
  booked: {
    label: "Booked",
    description: "Job confirmed — get your items to our Houston hub next.",
    icon: "CheckCircle2",
  },
  pickup_scheduled: {
    label: "Pickup scheduled",
    description: "We've set a window to collect your items.",
    icon: "CalendarCheck",
  },
  picked_up: {
    label: "Picked up",
    description: "Your items are on the way to our workshop.",
    icon: "PackageCheck",
  },
  in_workshop: {
    label: "In the workshop",
    description: "Our pros are building it, piece by piece.",
    icon: "Wrench",
  },
  assembled_inspected: {
    label: "Assembled & inspected",
    description: "Built, quality-checked, and photographed.",
    icon: "ClipboardCheck",
  },
  out_for_delivery: {
    label: "Out for delivery",
    description: "On the truck and headed your way.",
    icon: "Truck",
  },
  delivered: {
    label: "Delivered",
    description: "Placed in the room. Enjoy it!",
    icon: "PartyPopper",
  },
};

export function statusIndex(status: CustomerOrderStatus): number {
  return ORDER_STATUS_ORDER.indexOf(status);
}

export function nodeStateFor(
  step: CustomerOrderStatus,
  current: CustomerOrderStatus
): TimelineNodeState {
  const s = statusIndex(step);
  const c = statusIndex(current);
  if (s < c) return "done";
  if (s === c) return "active";
  return "upcoming";
}

/** Rough relative time for the active timeline step. */
export function formatUpdatedAgo(iso: string, nowMs = Date.now()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "just now";
  const diffMs = Math.max(0, nowMs - then);
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
