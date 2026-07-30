import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listCustomerJobs } from "@/lib/orders/customer-jobs";
import { publicEnv } from "@/lib/env";

/**
 * GET /api/customer/jobs
 * Lists customer-visible jobs for the signed-in user (RLS + customer_id).
 * Phase C2 — read path only; fixtures are not returned here.
 */
export async function GET() {
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
      { ok: false, error: "unauthorized", message: "Sign in to view jobs." },
      { status: 401 }
    );
  }

  const { jobs, error } = await listCustomerJobs(supabase, user.id);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error,
        message: "Could not load jobs. Try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, jobs });
}
