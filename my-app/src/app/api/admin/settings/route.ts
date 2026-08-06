import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  adminSettingsSchema,
  fetchAdminSettings,
  saveAdminSettings,
} from "@/lib/admin/settings";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings — full admin settings (deposit, hub, ops_rules).
 * PUT  — replace all three keys (Settings Save).
 * requireAdmin + service role write.
 */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) {
    const status =
      gate.reason === "unauthenticated"
        ? 401
        : gate.reason === "not_configured"
          ? 503
          : 403;
    return NextResponse.json(
      { ok: false, error: gate.reason },
      { status }
    );
  }

  try {
    const settings = await fetchAdminSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    console.error("[api/admin/settings GET]", e);
    return NextResponse.json(
      { ok: false, error: "settings_read_failed" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    const status =
      gate.reason === "unauthenticated"
        ? 401
        : gate.reason === "not_configured"
          ? 503
          : 403;
    return NextResponse.json(
      { ok: false, error: gate.reason },
      { status }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const parsed = adminSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "validation_failed",
        message: parsed.error.issues[0]?.message,
      },
      { status: 400 }
    );
  }

  try {
    const settings = await saveAdminSettings(parsed.data);
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    console.error("[api/admin/settings PUT]", e);
    return NextResponse.json(
      { ok: false, error: "settings_write_failed" },
      { status: 500 }
    );
  }
}
