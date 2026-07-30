"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Check,
  Copy,
  Gift,
  Send,
  UserPlus,
  Wallet,
} from "lucide-react";

/**
 * Refer & Earn — design_handoff_portal RefV2 (locked): gradient hero with
 * copyable link, 3-step how-it-works, credit ring + recent referrals.
 * Link/credits/referrals are demo fixtures until a referrals API lands.
 */

const REFERRAL_LINK = "screwitpros.com/r/MORGAN20";

const STEPS = [
  {
    icon: Send,
    title: "Share your link",
    body: "Send it to a friend by text, email, or social.",
  },
  {
    icon: UserPlus,
    title: "They book a build",
    body: "Your friend gets $20 off their first order.",
  },
  {
    icon: Wallet,
    title: "You earn $20",
    body: "Credit lands in your account, auto-applied.",
  },
] as const;

const RECENT_REFS = [
  { name: "Jamie L.", value: "+$20", earned: true },
  { name: "Priya S.", value: "Pending", earned: false },
] as const;

export default function ReferralsView() {
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );

  const onCopy = async () => {
    const url = `https://${REFERRAL_LINK}`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(url);
      ok = true;
    } catch {
      // Clipboard API blocked (permissions/insecure context) — legacy fallback.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    if (!ok) return;
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="screen-anim" style={{ width: "100%" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={h1Style}>Refer &amp; Earn</h1>
        <p style={subStyle}>Give $20, get $20 toward your next build.</p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={heroCardStyle}>
          <div style={heroGradientStyle}>
            <div style={heroIconTileStyle}>
              <Gift size={28} color="#fff" aria-hidden />
            </div>
            <div style={heroTitleStyle}>Give $20, get $20</div>
            <p style={heroSubStyle}>
              Everyone you refer gets $20 off their first assembly. You get
              $20 in credit the moment they book.
            </p>
            <div style={linkRowStyle}>
              <div style={linkBoxStyle}>{REFERRAL_LINK}</div>
              <button
                type="button"
                onClick={onCopy}
                className="ref-copy-btn"
                style={copyBtnStyle}
              >
                {copied ? (
                  <Check size={16} color="var(--blue-deep)" aria-hidden />
                ) : (
                  <Copy size={16} color="var(--blue-deep)" aria-hidden />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div style={stepsGridStyle}>
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                style={{
                  padding: "24px 20px",
                  borderLeft: i > 0 ? "1px solid var(--gray-100)" : "none",
                }}
              >
                <div style={stepIconTileStyle}>
                  <step.icon
                    size={20}
                    color="var(--blue-electric)"
                    aria-hidden
                  />
                  <span style={stepBadgeStyle}>{i + 1}</span>
                </div>
                <div style={stepTitleStyle}>{step.title}</div>
                <div style={stepBodyStyle}>{step.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={bottomGridStyle}>
          <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={ringOuterStyle} aria-hidden>
              <div style={ringInnerStyle}>2/3</div>
            </div>
            <div>
              <div style={{ ...capsStyle, marginBottom: 3 }}>
                Credit balance
              </div>
              <div style={creditAmountStyle}>$40.00</div>
              <div style={creditNoteStyle}>2 of 3 friends booked</div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ ...capsStyle, marginBottom: 10 }}>Recent</div>
            {RECENT_REFS.map((ref, i) => (
              <div
                key={ref.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "7px 0",
                  borderTop: i > 0 ? "1px solid var(--gray-100)" : "none",
                }}
              >
                <span style={refAvatarStyle}>{ref.name[0]}</span>
                <span style={refNameStyle}>{ref.name}</span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: ref.earned
                      ? "var(--status-success)"
                      : "var(--ink-300)",
                  }}
                >
                  {ref.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
  background: "#fff",
  border: "1px solid var(--border-default)",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 8px 24px -18px rgba(4, 32, 155, 0.12)",
};

const heroCardStyle: CSSProperties = {
  ...cardStyle,
  padding: 0,
  overflow: "hidden",
  textAlign: "center",
  marginBottom: 16,
};

const heroGradientStyle: CSSProperties = {
  background:
    "linear-gradient(135deg, var(--blue-deep), var(--blue-electric))",
  padding: "36px 28px 30px",
  color: "#fff",
};

const heroIconTileStyle: CSSProperties = {
  width: 60,
  height: 60,
  borderRadius: 18,
  background: "rgba(255, 255, 255, 0.14)",
  display: "grid",
  placeItems: "center",
  margin: "0 auto 16px",
};

const heroTitleStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 400,
  fontSize: 32,
  letterSpacing: "-0.02em",
  marginBottom: 6,
};

const heroSubStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 14.5,
  color: "var(--blue-200)",
  maxWidth: "42ch",
  margin: "0 auto",
  lineHeight: 1.5,
};

const linkRowStyle: CSSProperties = {
  maxWidth: 440,
  margin: "22px auto 0",
  display: "flex",
  gap: 10,
};

const linkBoxStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: 48,
  borderRadius: 10,
  background: "rgba(255, 255, 255, 0.14)",
  border: "1px solid rgba(255, 255, 255, 0.24)",
  display: "flex",
  alignItems: "center",
  padding: "0 16px",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  color: "#fff",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

const copyBtnStyle: CSSProperties = {
  border: "none",
  cursor: "pointer",
  background: "#fff",
  color: "var(--blue-deep)",
  borderRadius: 10,
  padding: "0 22px",
  minHeight: 48,
  fontFamily: "var(--font-body)",
  fontSize: 14,
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  flex: "0 0 auto",
};

const stepsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
};

const stepIconTileStyle: CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "var(--blue-50)",
  display: "grid",
  placeItems: "center",
  margin: "0 auto 12px",
  position: "relative",
};

const stepBadgeStyle: CSSProperties = {
  position: "absolute",
  top: -6,
  right: -6,
  width: 20,
  height: 20,
  borderRadius: 999,
  background: "var(--blue-deep)",
  color: "#fff",
  fontFamily: "var(--font-body)",
  fontSize: 11,
  fontWeight: 800,
  display: "grid",
  placeItems: "center",
};

const stepTitleStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 14.5,
  fontWeight: 700,
  color: "var(--blue-deep)",
  marginBottom: 4,
};

const stepBodyStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 12.5,
  color: "var(--ink-500)",
  lineHeight: 1.5,
};

const bottomGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};

const capsStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--ink-300)",
};

const ringOuterStyle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: 999,
  flex: "0 0 64px",
  display: "grid",
  placeItems: "center",
  background:
    "conic-gradient(var(--blue-electric) 0% 66%, var(--gray-100) 66% 100%)",
};

const ringInnerStyle: CSSProperties = {
  width: 50,
  height: 50,
  borderRadius: 999,
  background: "#fff",
  display: "grid",
  placeItems: "center",
  fontFamily: "var(--font-body)",
  fontSize: 12.5,
  fontWeight: 800,
  color: "var(--blue-deep)",
};

const creditAmountStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 400,
  fontSize: 32,
  letterSpacing: "-0.02em",
  color: "var(--blue-deep)",
  lineHeight: 1,
};

const creditNoteStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 12.5,
  color: "var(--ink-500)",
  marginTop: 3,
};

const refAvatarStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  background: "var(--gray-50)",
  border: "1px solid var(--border-default)",
  display: "grid",
  placeItems: "center",
  fontFamily: "var(--font-body)",
  fontSize: 11.5,
  fontWeight: 700,
  color: "var(--ink-500)",
  flex: "0 0 28px",
};

const refNameStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 700,
  color: "var(--ink-900)",
};
