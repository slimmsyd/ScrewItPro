import type { Metadata } from "next";
import {
  fetchInquiries,
  fetchWaitlist,
  isAdminDashboardConfigured,
  isAdminKeyValid,
} from "@/lib/admin/leads";

/**
 * /admin/leads?key=... — interim internal view of captured leads (inquiries +
 * waitlist). Gated by ADMIN_DASHBOARD_TOKEN. Hardens under M1 role guards later.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

const wrap: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  maxWidth: 1100,
  margin: "0 auto",
  padding: "32px 20px",
  color: "#0b1030",
};

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h1>
      <p style={{ color: "#545b7a", fontSize: 15, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

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
  // Stable, locale-independent formatting (avoids hydration drift).
  return dt?.replace("T", " ").slice(0, 16) ?? "";
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  if (!isAdminDashboardConfigured()) {
    return (
      <Notice
        title="Leads view is not configured"
        body="Set ADMIN_DASHBOARD_TOKEN in the environment, then open this page with ?key=<token>."
      />
    );
  }

  const { key } = await searchParams;
  if (!isAdminKeyValid(key)) {
    return (
      <Notice
        title="Unauthorized"
        body="Append ?key=<ADMIN_DASHBOARD_TOKEN> to the URL to view captured leads."
      />
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
    background: "#04209b",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  };

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Leads</h1>
      <p style={{ color: "#545b7a", fontSize: 14, marginBottom: 24 }}>
        Internal view — captured inquiries and waitlist signups.
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
          <a
            style={csvBtn}
            href={`/api/admin/leads/export?type=inquiries&key=${encodeURIComponent(
              key ?? ""
            )}`}
          >
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
                    <td style={td}>{r.name ?? "—"}</td>
                    <td style={td}>{r.email}</td>
                    <td style={td}>{r.service ?? "—"}</td>
                    <td style={{ ...td, maxWidth: 280 }}>{r.message ?? "—"}</td>
                    <td style={td}>{r.source ?? "—"}</td>
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
          <a
            style={csvBtn}
            href={`/api/admin/leads/export?type=waitlist&key=${encodeURIComponent(
              key ?? ""
            )}`}
          >
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
                    <td style={td}>{r.name ?? "—"}</td>
                    <td style={td}>{r.email}</td>
                    <td style={td}>{r.provider ?? "—"}</td>
                    <td style={td}>{r.source ?? "—"}</td>
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
