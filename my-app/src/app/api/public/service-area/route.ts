import { NextResponse } from "next/server";
import { getServiceAreaConfig } from "@/lib/config/service-area";

export const dynamic = "force-dynamic";

/**
 * GET /api/public/service-area
 * Safe public subset for marketing map + quote address gate.
 * No secrets. No auth.
 */
export async function GET() {
  try {
    const c = await getServiceAreaConfig();
    return NextResponse.json(
      {
        ok: true as const,
        address: c.address,
        lat: c.lat,
        lng: c.lng,
        radiusMiles: c.radiusMiles,
        radiusM: c.radiusM,
        /** Model 1 out-of-area travel fee (dollars). Server re-prices at book. */
        farFee: c.farFee,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (e) {
    console.error("[api/public/service-area]", e);
    return NextResponse.json(
      { ok: false, error: "service_area_unavailable" },
      { status: 500 }
    );
  }
}
