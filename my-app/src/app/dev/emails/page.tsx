import { notFound } from "next/navigation";
import { emailPreviews } from "@/lib/emails/templates";
import { getOutbox, isEmailReady } from "@/lib/emails/dispatch";

/**
 * /dev/emails — in-browser gallery of every transactional email template.
 * Lets the client review + approve email designs BEFORE any Resend key exists.
 * Also shows the outbox: emails a real signup/inquiry captured while gated.
 *
 * Dev-only: returns 404 in production.
 */
export const dynamic = "force-dynamic";

export default async function DevEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { t } = await searchParams;
  const selectedKey = t ?? emailPreviews[0].key;
  const selected =
    emailPreviews.find((p) => p.key === selectedKey) ?? emailPreviews[0];
  const rendered = selected.render();
  const outbox = getOutbox();
  const ready = isEmailReady();

  const sidebar: React.CSSProperties = {
    width: 260,
    flex: "none",
    borderRight: "1px solid #d8ddeb",
    padding: 20,
    background: "#f4f6fb",
    minHeight: "100vh",
  };
  const link = (active: boolean): React.CSSProperties => ({
    display: "block",
    padding: "9px 12px",
    marginBottom: 6,
    borderRadius: 8,
    fontSize: 14,
    textDecoration: "none",
    color: active ? "#ffffff" : "#2a3050",
    background: active ? "#1d6efe" : "transparent",
    fontWeight: active ? 600 : 500,
  });

  return (
    <div style={{ display: "flex", fontFamily: "system-ui, sans-serif" }}>
      <aside style={sidebar}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#545b7a",
            marginBottom: 14,
          }}
        >
          Email templates
        </div>
        {emailPreviews.map((p) => (
          <a
            key={p.key}
            href={`/dev/emails?t=${p.key}`}
            style={link(p.key === selected.key)}
          >
            {p.label}
          </a>
        ))}

        <div
          style={{
            marginTop: 24,
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 12.5,
            lineHeight: 1.5,
            background: ready ? "#e6f7ee" : "#fff4e5",
            color: ready ? "#0a6b3a" : "#8a5300",
            border: `1px solid ${ready ? "#b7e4c9" : "#ffd8a8"}`,
          }}
        >
          <strong>{ready ? "Resend: LIVE" : "Resend: gated"}</strong>
          <br />
          {ready
            ? "Emails send for real."
            : "No RESEND_API_KEY — real sends are captured to the outbox below instead."}
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#545b7a",
            marginBottom: 10,
          }}
        >
          Outbox ({outbox.length})
        </div>
        {outbox.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "#9aa1bc" }}>
            No captured emails yet. Submit a waitlist or quote form, then refresh.
          </div>
        ) : (
          outbox.slice(0, 12).map((e) => (
            <div
              key={e.id}
              style={{
                fontSize: 12,
                padding: "8px 10px",
                marginBottom: 6,
                borderRadius: 6,
                background: "#ffffff",
                border: "1px solid #e9edf6",
              }}
            >
              <div style={{ fontWeight: 600, color: "#0b1030" }}>
                {e.subject}
              </div>
              <div style={{ color: "#545b7a" }}>
                → {Array.isArray(e.to) ? e.to.join(", ") : e.to}
              </div>
              <div style={{ color: e.sentLive ? "#0a6b3a" : "#8a5300" }}>
                {e.sentLive ? "sent live" : "captured (gated)"}
              </div>
            </div>
          ))
        )}
      </aside>

      <main style={{ flex: 1, padding: 24, background: "#ffffff" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 20, color: "#0b1030" }}>
          {selected.label}
        </h1>
        <div style={{ fontSize: 13, color: "#545b7a", marginBottom: 16 }}>
          Subject: <strong>{rendered.subject}</strong>
        </div>
        <iframe
          title={selected.label}
          srcDoc={rendered.html}
          style={{
            width: "100%",
            height: "78vh",
            border: "1px solid #d8ddeb",
            borderRadius: 12,
            background: "#f4f6fb",
          }}
        />
      </main>
    </div>
  );
}
