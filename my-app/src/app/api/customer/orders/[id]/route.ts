import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCustomerJob } from "@/lib/orders/customer-jobs";
import { publicEnv } from "@/lib/env";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/customer/orders/[id]
 * Single job by order_number (SIP-xxxxx) or uuid.
 * Phase C2 — ownership enforced by RLS + customer_id filter.
 */
export async function GET(_request: Request, context: RouteContext) {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "orders_not_configured",
        message: "Supabase is not configured.",
      },
      { status: 503 }
    );
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "orders_not_configured",
        message: "Supabase is not configured.",
      },
      { status: 503 }
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthorized", message: "Sign in to view this job." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json(
      { ok: false, error: "not_found", message: "Order not found." },
      { status: 404 }
    );
  }

  const { job, error } = await getCustomerJob(supabase, user.id, id);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error,
        message: "Could not load order. Try again.",
      },
      { status: 500 }
    );
  }

  // Not found, not owned, or not customer-visible (draft) → same 404
  if (!job) {
    return NextResponse.json(
      { ok: false, error: "not_found", message: "Order not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, job });
}
