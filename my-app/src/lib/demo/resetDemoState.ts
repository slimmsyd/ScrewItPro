import { clearQuoteDraft } from "@/lib/quote/draft-storage";
import { clearBookedSnapshot } from "@/lib/orders/booked-snapshot";

/**
 * Wipe client-side quote + post-book demo state for a clean soft-gate walkthrough.
 * Does not touch auth session or mock order fixtures (those live in code).
 */
export function resetPortalDemoState(): void {
  clearQuoteDraft();
  clearBookedSnapshot();
}

export const DEMO_STORAGE_KEYS = [
  "screwitpro_quote_draft_v1",
  "screwitpro_booked_snapshot_v1",
] as const;
