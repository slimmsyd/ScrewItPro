import type { CustomerOrderStatus, MockOrder } from "./types";
import { getMockOrder, listMockOrderIds } from "./mock-order";
import { statusIndex } from "./status";

/**
 * Portal job catalog — list / segment / hero selection / next-step copy.
 * Single seam for Dashboard + My Jobs until a real jobs API lands.
 */

export function listPortalJobs(): MockOrder[] {
  return listMockOrderIds()
    .map((id) => getMockOrder(id))
    .filter((o): o is MockOrder => o != null);
}

export function listActiveJobs(): MockOrder[] {
  return listPortalJobs().filter((o) => o.status !== "delivered");
}

export function listPastJobs(): MockOrder[] {
  return listPortalJobs().filter((o) => o.status === "delivered");
}

/**
 * Highest statusIndex among non-delivered jobs (ties → first in fixture order).
 * After soft-gate book, SIP-4471 is the only active → Booked hero is correct.
 * Demo fixtures prefer SIP-WORK (in_workshop) when present.
 */
export function primaryActiveJob(): MockOrder | null {
  const active = listActiveJobs();
  if (active.length === 0) return null;

  let best = active[0]!;
  let bestIdx = statusIndex(best.status);

  for (let i = 1; i < active.length; i++) {
    const job = active[i]!;
    const idx = statusIndex(job.status);
    if (idx > bestIdx) {
      best = job;
      bestIdx = idx;
    }
  }
  return best;
}

/** Full job price for list rows (delivered fixtures zero out balance). */
export function jobTotalCents(order: MockOrder): number {
  return order.totalCents ?? order.depositCents + order.balanceCents;
}

export type PortalNextStep = {
  title: string;
  body: string;
  cta: string;
};

/**
 * Derive dashboard "Your next step" from status.
 * Do not trust mock nextStep alone for portal hero (fixture copy is quote-era).
 */
export function nextStepForStatus(
  status: CustomerOrderStatus
): PortalNextStep {
  switch (status) {
    case "booked":
      return {
        title: "Ship your items to our hub",
        body: "Address & label are in your email. We take it from there.",
        cta: "View shipping details",
      };
    case "pickup_scheduled":
      return {
        title: "Be ready for pickup",
        body: "Have items accessible in the window we confirmed.",
        cta: "View pickup window",
      };
    case "picked_up":
      return {
        title: "We're on the way to the workshop",
        body: "No action needed — we'll update you when assembly starts.",
        cta: "Track this order",
      };
    case "in_workshop":
      return {
        title: "Pick your delivery window",
        body: "Almost built — choose when we bring it home.",
        cta: "Choose window",
      };
    case "assembled_inspected":
      return {
        title: "Confirm delivery details",
        body: "QC is done. Lock in your delivery window if you haven't.",
        cta: "Choose window",
      };
    case "out_for_delivery":
      return {
        title: "Get ready for delivery",
        body: "Your build is on the truck. Clear a path to the room.",
        cta: "Track delivery",
      };
    case "delivered":
      return {
        title: "Enjoy your furniture",
        body: "Need a tweak or photos? Message support anytime.",
        cta: "View order",
      };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/** Track URL for an order (keeps Phase 0–3 path; no /jobs/[id] yet). */
export function portalTrackHref(orderId: string): string {
  return `/customer/orders/${encodeURIComponent(orderId)}/track`;
}
