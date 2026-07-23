import { DEFAULT_ASSEMBLY_CENTS } from "@/lib/quote/pricing";
import type { LookupResult } from "@/lib/quote/product-lookup";

/**
 * TEMPORARY v1 pricing for real (non-mock) looked-up products. Assembly fee
 * is meant to eventually come from a team-curated complexity-tier/category
 * catalog (see docs/TASKRABBIT_REVERSE_ENGINEERING.md §9), not from retail
 * price — that catalog doesn't exist yet. This is the ONLY place that
 * decision should live; do not inline assembly-fee math anywhere else for
 * lookup-sourced items.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- signature intentionally takes the full result so a future tier-catalog lookup can key off name/retailer without changing callers
export function resolveAssemblyFeeForLookup(product: LookupResult): number {
  return DEFAULT_ASSEMBLY_CENTS;
}
