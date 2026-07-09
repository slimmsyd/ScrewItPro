import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/session
 * Returns the lightweight OAuth session (if any) for the join success UI.
 */
export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("sip_session")?.value;
  if (!raw) {
    return NextResponse.json({ user: null });
  }
  try {
    const user = JSON.parse(raw) as {
      email: string;
      name?: string;
      picture?: string;
      provider?: string;
    };
    return NextResponse.json({
      user: {
        email: user.email,
        name: user.name ?? "",
        picture: user.picture ?? "",
        provider: user.provider ?? "google",
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
