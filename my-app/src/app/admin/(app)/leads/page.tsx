import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import { fetchInquiries, fetchWaitlist } from "@/lib/admin/leads";

/**
 * /admin/leads - internal view of captured leads.
 * Shell layout already requireAdmin(); re-check for defense in depth.
 * No URL secrets.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leads · Admin",
  robots: { index: false, follow: false },
};

const wrap: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  maxWidth: 1100,
  width: "100%",
  color: "var(--ink-900)",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#545b7a",
  borderBottom: "2px solid #d8ddeb",
  whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 13.5,
  borderBottom: "1px solid #e9edf6",
  verticalAlign: "top",
};

function fmt(dt: string): string {
  return dt?.replace("T", " ").slice(0, 16) ?? "";
}

export default async function AdminLeadsPage() {
  const gate = await requireAdmin();
  // Layout redirects non-admins; this is a hard stop if layout is bypassed.
  if (!gate.ok) {
    return (
      <p style={{ color: "var(--ink-500)", fontSize: 14 }}>
        Admin access required.
      </p>
    );
  }

  const [inquiries, waitlist] = await Promise.all([
    fetchInquiries(),
    fetchWaitlist(),
  ]);

  const csvBtn: React.CSSProperties = {
    display: "inline-block",
    padding: "7px 14px",
    borderRadius: 8,
    background: "var(--blue-deep)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  };

  return (
    <div style={wrap}>
      <p style={{ color: "var(--ink-500)", fontSize: 14, marginBottom: 24, marginTop: 0 }}>
        Captured inquiries and waitlist signups - signed in as{" "}
        {gate.email || "admin"}.
      </p>

      <section style={{ marginBottom: 40 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 18, margin: 0 }}>
            Inquiries ({inquiries.length})
          </h2>
          <a style={csvBtn} href="/api/admin/leads/export?type=inquiries">
            Download CSV
          </a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Created</th>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Service</th>
                <th style={th}>Message</th>
                <th style={th}>Source</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td style={td} colSpan={6}>
                    No inquiries yet.
                  </td>
                </tr>
              ) : (
                inquiries.map((r) => (
                  <tr key={r.id}>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      {fmt(r.created_at)}
                    </td>
                    <td style={td}>{r.name ?? "-"}</td>
                    <td style={td}>{r.email}</td>
                    <td style={td}>{r.service ?? "-"}</td>
                    <td style={{ ...td, maxWidth: 280 }}>{r.message ?? "-"}</td>
                    <td style={td}>{r.source ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2 style={{ fontSize: 18, margin: 0 }}>
            Waitlist ({waitlist.length})
          </h2>
          <a style={csvBtn} href="/api/admin/leads/export?type=waitlist">
            Download CSV
          </a>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Created</th>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Provider</th>
                <th style={th}>Source</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.length === 0 ? (
                <tr>
                  <td style={td} colSpan={5}>
                    No waitlist signups yet.
                  </td>
                </tr>
              ) : (
                waitlist.map((r) => (
                  <tr key={r.id}>
                    <td style={{ ...td, whiteSpace: "nowrap" }}>
                      {fmt(r.created_at)}
                    </td>
                    <td style={td}>{r.name ?? "-"}</td>
                    <td style={td}>{r.email}</td>
                    <td style={td}>{r.provider ?? "-"}</td>
                    <td style={td}>{r.source ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
