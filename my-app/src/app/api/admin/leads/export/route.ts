import { NextResponse } from "next/server";
import {
  fetchInquiries,
  fetchWaitlist,
  isAdminKeyValid,
  toCsv,
} from "@/lib/admin/leads";

/**
 * GET /api/admin/leads/export?key=...&type=inquiries|waitlist
 * Returns a CSV of captured leads. Gated by ADMIN_DASHBOARD_TOKEN (interim).
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const type = url.searchParams.get("type") ?? "inquiries";

  if (!isAdminKeyValid(key)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

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
