import type { ResolvedPlace } from "@/lib/places";
import type { QuoteDraft } from "@/lib/quote/types";
import { EMPTY_DRAFT } from "@/lib/quote/types";

export const QUOTE_DRAFT_KEY = "screwitpro_quote_draft_v1";

/**
 * Seed draft from marketing hero before navigating to /quote (no React context).
 * Prefills both stops as a customer pickup → delivery route (editable on Where).
 * User can still switch to "ship to hub" on the Where step.
 */
export function seedQuoteDraftFromHero(
  pickup: ResolvedPlace,
  deliver: ResolvedPlace
): void {
  const existing = loadQuoteDraft();
  saveQuoteDraft({
    ...existing,
    pickupAddress: pickup,
    deliveryAddress: deliver,
    shipToHub: false,
    pickupMode: "pickup",
  });
}

export function loadQuoteDraft(): QuoteDraft {
  if (typeof window === "undefined") return { ...EMPTY_DRAFT, items: [] };
  try {
    const raw = sessionStorage.getItem(QUOTE_DRAFT_KEY);
    if (!raw) return { ...EMPTY_DRAFT, items: [] };
    const parsed = JSON.parse(raw) as QuoteDraft;
    return {
      ...EMPTY_DRAFT,
      ...parsed,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { ...EMPTY_DRAFT, items: [] };
  }
}

export function saveQuoteDraft(draft: QuoteDraft): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(QUOTE_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota / private mode
  }
}

export function clearQuoteDraft(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(QUOTE_DRAFT_KEY);
  } catch {
    // ignore
  }
}
