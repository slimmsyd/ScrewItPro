import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env";

/**
 * GET /api/health
 * Returns which integrations are configured (no secret values).
 */
export async function GET() {
  const status = getEnvStatus();
  const ready =
    status.supabase.configured &&
    status.stripe.configured &&
    status.resend.configured &&
    status.deepseek.configured &&
    status.google.mapsConfigured;

  return NextResponse.json(
    {
      ok: true,
      service: "ScrewItPro",
      ready,
      integrations: status,
    },
    { status: 200 }
  );
}
