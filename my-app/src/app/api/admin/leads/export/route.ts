import { NextResponse } from "next/server";
import {
  fetchInquiries,
  fetchWaitlist,
  toCsv,
} from "@/lib/admin/leads";
import { requireAdmin } from "@/lib/auth/require-admin";

/**
 * GET /api/admin/leads/export?type=inquiries|waitlist
 * CSV export — gated by requireAdmin() (session + profiles.role).
 */
export async function GET(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    const status = gate.reason === "unauthenticated" ? 401 : 403;
    return NextResponse.json(
      { ok: false, error: gate.reason === "unauthenticated" ? "unauthorized" : "forbidden" },
      { status }
    );
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "inquiries";

  let csv: string;
  let filename: string;

  if (type === "waitlist") {
    const rows = await fetchWaitlist();
    csv = toCsv(rows, [
      "created_at",
      "name",
      "email",
      "provider",
      "source",
      "id",
    ]);
    filename = "waitlist.csv";
  } else {
    const rows = await fetchInquiries();
    csv = toCsv(rows, [
      "created_at",
      "name",
      "email",
      "phone",
      "service",
      "message",
      "source",
      "status",
      "id",
    ]);
    filename = "inquiries.csv";
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
