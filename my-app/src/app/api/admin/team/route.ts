import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { fetchTeamRoster } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/team — super admins (env) + staff profiles.
 * requireAdmin; service-role list (super admins may lack profiles.role=admin).
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
    return NextResponse.json({ ok: false, error: gate.reason }, { status });
  }

  try {
    const roster = await fetchTeamRoster();
    return NextResponse.json({
      ok: true,
      superAdmins: roster.superAdmins,
      members: roster.members,
      inviterIsSuperAdmin: gate.isSuperAdmin,
    });
  } catch (e) {
    console.error("[api/admin/team GET]", e);
    return NextResponse.json(
      { ok: false, error: "team_list_failed" },
      { status: 500 }
    );
  }
}
