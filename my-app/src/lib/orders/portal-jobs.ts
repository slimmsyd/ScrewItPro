import type { CustomerOrderStatus, MockOrder } from "./types";
import { getMockOrder, listMockOrderIds } from "./mock-order";
import { statusIndex } from "./status";
import {
  nextStepForStatus as nextStepFromPostBook,
  type PortalNextStep,
} from "./post-book-content";

/**
 * Portal job catalog — list / segment / hero selection / next-step copy.
 * My Jobs (Phase C2) loads real rows via GET /api/customer/jobs.
 * Fixture helpers remain for ?demo=1 and dev tooling.
 * Next-step copy: single source in post-book-content.ts.
 */

/** Segment helpers that work on any job array (API or fixtures). */
export function segmentActiveJobs(jobs: MockOrder[]): MockOrder[] {
  return jobs.filter((o) => o.status !== "delivered");
}

export function segmentPastJobs(jobs: MockOrder[]): MockOrder[] {
  return jobs.filter((o) => o.status === "delivered");
}

export function listPortalJobs(): MockOrder[] {
  return listMockOrderIds()
    .map((id) => getMockOrder(id))
    .filter((o): o is MockOrder => o != null);
}

export function listActiveJobs(): MockOrder[] {
  return segmentActiveJobs(listPortalJobs());
}

export function listPastJobs(): MockOrder[] {
  return segmentPastJobs(listPortalJobs());
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

export type { PortalNextStep };

/**
 * Derive "Your next step" from status.
 * Canonical copy lives in post-book-content.ts (confirmation, email, track, jobs).
 */
export function nextStepForStatus(
  status: CustomerOrderStatus
): PortalNextStep {
  return nextStepFromPostBook(status);
}

/** Track URL for an order (keeps Phase 0–3 path; no /jobs/[id] yet). */
export function portalTrackHref(orderId: string): string {
  return `/customer/orders/${encodeURIComponent(orderId)}/track`;
}
