import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { inviteMemberSchema, inviteTeamMember } from "@/lib/admin/team";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/team/invite — { email, role: admin|technician|driver }
 * Super admin required to grant admin. Never grants super-admin (env only).
 */
export async function POST(req: Request) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const parsed = inviteMemberSchema.safeParse(body);
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

  const result = await inviteTeamMember({
    email: parsed.data.email,
    role: parsed.data.role,
    inviterIsSuperAdmin: gate.isSuperAdmin,
    inviterEmail: gate.email,
  });

  if (!result.ok) {
    const status =
      result.error === "role_not_allowed"
        ? 403
        : result.error === "already_staff"
          ? 409
          : result.error === "not_configured"
            ? 503
            : 500;
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        message: result.message,
      },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    member: result.member,
    createdAuthUser: result.createdAuthUser,
    emailSent: result.emailSent,
    emailError: result.emailError,
  });
}
