import { NextResponse } from "next/server";
import { getEnvStatus } from "@/lib/env";
import { isWaitlistBackendReady } from "@/lib/waitlist";

/**
 * GET /api/health
 * Returns which integrations are configured (no secret values).
 */
export async function GET() {
  const status = getEnvStatus();
  const waitlistReady = isWaitlistBackendReady();
  const ready =
    waitlistReady &&
    status.stripe.configured &&
    status.resend.configured &&
    status.deepseek.configured &&
    status.google.mapsConfigured;

  return NextResponse.json(
    {
      ok: true,
      service: "ScrewItPro",
      ready,
      waitlist: { ready: waitlistReady },
      integrations: status,
    },
    { status: 200 }
  );
}
