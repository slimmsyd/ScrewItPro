"use client";

import { useState, type CSSProperties } from "react";

/**
 * Notification preferences — design_handoff_portal Notifications view.
 * Prefs are demo state only (no persistence); wire to member profile API
 * alongside the real jobs API.
 */

type PrefRow = {
  key: string;
  title: string;
  body: string;
  defaultOn: boolean;
};

const PREF_ROWS: PrefRow[] = [
  {
    key: "status",
    title: "Order status updates",
    body: "Email + SMS when your job moves a step",
    defaultOn: true,
  },
  {
    key: "delivery",
    title: "Delivery reminders",
    body: "A heads-up the day before delivery",
    defaultOn: true,
  },
  {
    key: "photos",
    title: "Photos ready",
    body: "When workshop & delivery photos are posted",
    defaultOn: true,
  },
  {
    key: "promos",
    title: "Promotions & offers",
    body: "Occasional deals and seasonal offers",
    defaultOn: false,
  },
  {
    key: "referrals",
    title: "Referral activity",
    body: "When a friend you referred books",
    defaultOn: true,
  },
];

const DEFAULT_PREFS: Record<string, boolean> = Object.fromEntries(
  PREF_ROWS.map((r) => [r.key, r.defaultOn])
);

export default function NotificationsView() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(DEFAULT_PREFS);

  const toggle = (key: string) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="screen-anim" style={wrapStyle}>
      <div style={headerStyle}>
        <h1 style={h1Style}>Notifications</h1>
        <p style={subStyle}>Choose how and when we reach you.</p>
      </div>
      <div style={cardStyle}>
        {PREF_ROWS.map((row, i) => {
          const on = prefs[row.key] ?? row.defaultOn;
          return (
            <div
              key={row.key}
              style={{
                ...rowStyle,
                borderTop: i > 0 ? "1px solid var(--gray-100)" : "none",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={rowTitleStyle}>{row.title}</div>
                <div style={rowBodyStyle}>{row.body}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={row.title}
                onClick={() => toggle(row.key)}
                className="notif-toggle"
                style={toggleBtnStyle}
              >
                <span
                  className="notif-track"
                  style={{
                    ...trackStyle,
                    background: on
                      ? "var(--blue-electric)"
                      : "var(--gray-100)",
                  }}
                >
                  <span
                    className="notif-knob"
                    style={{ ...knobStyle, left: on ? 21 : 3 }}
                  />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const wrapStyle: CSSProperties = {
  maxWidth: 640,
  margin: "0 auto",
  width: "100%",
};

const headerStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: 20,
};

const h1Style: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontWeight: 400,
  fontSize: 30,
  letterSpacing: "-0.015em",
  color: "var(--blue-deep)",
};

const subStyle: CSSProperties = {
  margin: "5px 0 0",
  fontFamily: "var(--font-body)",
  fontSize: 14.5,
  color: "var(--ink-500)",
};

const cardStyle: CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  background: "#fff",
  border: "1px solid var(--border-default)",
  borderRadius: 14,
  boxShadow: "0 8px 24px -18px rgba(4, 32, 155, 0.12)",
  overflow: "hidden",
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "16px 20px",
};

const rowTitleStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 14.5,
  fontWeight: 700,
  color: "var(--blue-deep)",
};

const rowBodyStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 13,
  color: "var(--ink-500)",
  marginTop: 2,
};

/* 44px hit area around the 44×26 visual track */
const toggleBtnStyle: CSSProperties = {
  flex: "0 0 auto",
  height: 44,
  display: "inline-flex",
  alignItems: "center",
  background: "none",
  border: "none",
  padding: 0,
  margin: 0,
  cursor: "pointer",
};

const trackStyle: CSSProperties = {
  width: 44,
  height: 26,
  borderRadius: 999,
  position: "relative",
  display: "block",
};

const knobStyle: CSSProperties = {
  position: "absolute",
  top: 3,
  width: 20,
  height: 20,
  borderRadius: 999,
  background: "#fff",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
};
