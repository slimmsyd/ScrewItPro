/**
 * Server-side customer job reads (Phase C2).
 * Uses the user Supabase client + RLS — never service role.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MockOrder } from "./types";
import {
  mapDbOrderToPortal,
  mapDbOrdersToPortal,
  type DbOrderRow,
} from "./map-db-order-to-portal";

const ORDER_SELECT = `
  id,
  order_number,
  customer_email,
  contact_email,
  lifecycle_status,
  status,
  total_cents,
  deposit_cents,
  balance_cents,
  subtotal_cents,
  created_at,
  updated_at,
  metadata,
  order_items (
    name,
    quantity,
    fulfillment_mode,
    image_url,
    retailer,
    sort_order
  )
`;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/**
 * List customer-visible jobs for the signed-in user (newest first).
 * Pre-book / cancelled lifecycles are filtered in the mapper.
 */
export async function listCustomerJobs(
  supabase: SupabaseClient,
  userId: string
): Promise<{ jobs: MockOrder[]; error: string | null }> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[customer-jobs] list", error.message);
    return { jobs: [], error: "jobs_fetch_failed" };
  }

  const rows = (data ?? []) as unknown as DbOrderRow[];
  return { jobs: mapDbOrdersToPortal(rows), error: null };
}

/**
 * Fetch one job by display order_number (SIP-…) or uuid.
 * Returns null when not found, not owned (RLS), or not customer-visible.
 */
export async function getCustomerJob(
  supabase: SupabaseClient,
  userId: string,
  id: string
): Promise<{ job: MockOrder | null; error: string | null }> {
  const trimmed = id.trim();
  if (!trimmed) {
    return { job: null, error: null };
  }

  let query = supabase.from("orders").select(ORDER_SELECT).eq("customer_id", userId);

  if (isUuid(trimmed)) {
    query = query.eq("id", trimmed);
  } else {
    query = query.eq("order_number", trimmed);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("[customer-jobs] get", error.message);
    return { job: null, error: "jobs_fetch_failed" };
  }

  if (!data) {
    return { job: null, error: null };
  }

  const job = mapDbOrderToPortal(data as unknown as DbOrderRow);
  return { job, error: null };
}
