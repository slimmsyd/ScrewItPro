import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { fetchInquiries, fetchWaitlist } from "@/lib/admin/leads";
import { CUSTOMER_HOME_PATH, JOIN_PATH } from "@/lib/site";

/**
 * /admin/leads — internal view of captured leads.
 * Gated by profiles.role = admin (requireAdmin). No URL secrets.
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

function Notice({
  title,
  body,
  href,
  linkLabel,
}: {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div style={wrap}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>{title}</h1>
      <p style={{ color: "#545b7a", fontSize: 15, lineHeight: 1.6 }}>{body}</p>
      {href && linkLabel && (
        <p style={{ marginTop: 16 }}>
          <Link href={href} style={{ color: "#1d6efe", fontWeight: 600 }}>
            {linkLabel}
          </Link>
        </p>
      )}
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
  return dt?.replace("T", " ").slice(0, 16) ?? "";
}

export default async function AdminLeadsPage() {
  const gate = await requireAdmin();

  if (gate.ok === false) {
    if (gate.reason === "unauthenticated") {
      redirect(`${JOIN_PATH}?mode=login&return_to=${encodeURIComponent("/admin/leads")}`);
    }
    if (gate.reason === "not_configured") {
      return (
        <Notice
          title="Auth not configured"
          body="Supabase must be configured to gate the admin leads view."
        />
      );
    }
    return (
      <Notice
        title="Forbidden"
        body="Admin access requires profiles.role = 'admin'. Bootstrap the first admin in the Supabase SQL editor, then sign in again."
        href={CUSTOMER_HOME_PATH}
        linkLabel="Go to my portal"
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
        Internal view — signed in as {gate.email || "admin"}. Captured inquiries
        and waitlist signups.
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
