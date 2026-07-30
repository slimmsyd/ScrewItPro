import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWaitlistPosition } from "@/lib/waitlist";
import {
  roleFromAuthUser,
  statusFromAuthUser,
} from "@/lib/auth/roles";

/**
 * GET /api/auth/session
 * Returns the current Supabase Auth user (if any) for the join success UI.
 *
 * Reads the real session rather than parsing the old unsigned sip_session
 * cookie, so this is now a trustworthy answer to "who is signed in".
 * role/status come from app_metadata (Custom Access Token Hook when live).
 */
export async function GET() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ user: null });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ user: null });
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  // Position lives on the waitlist row, not the auth user.
  let position: number | null = null;
  try {
    const p = await getWaitlistPosition(user.email);
    position = p > 0 ? p : null;
  } catch {
    // Waitlist unavailable — still report the signed-in user.
    position = null;
  }

  return NextResponse.json({
    user: {
      email: user.email,
      name:
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        "",
      picture:
        (meta.avatar_url as string | undefined) ??
        (meta.picture as string | undefined) ??
        "",
      provider: (user.app_metadata?.provider as string | undefined) ?? "email",
      position,
      role: roleFromAuthUser(user),
      status: statusFromAuthUser(user),
    },
  });
}
