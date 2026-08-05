"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Check,
  Copy,
  Gift,
  Loader2,
  Send,
  UserPlus,
  Wallet,
} from "lucide-react";
import type { ReferralsPayload } from "@/lib/referrals/types";

/**
 * Refer & Earn Points — real per-user link + points balance.
 * Fetches GET /api/customer/referrals (no dollar fixtures).
 */

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ReferralsPayload };

export default function ReferralsView() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/customer/referrals", {
        credentials: "same-origin",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
      } & Partial<ReferralsPayload>;
      if (!res.ok || !json.ok || !json.code) {
        setState({
          status: "error",
          message:
            json.message ??
            (json.error === "unauthorized"
              ? "Sign in to view your referral link."
              : "Could not load referrals."),
        });
        return;
      }
      setState({
        status: "ready",
        data: {
          code: json.code,
          path: json.path ?? `/r/${json.code}`,
          pointsBalance: Number(json.pointsBalance ?? 0),
          friendsJoined: Number(json.friendsJoined ?? 0),
          recent: json.recent ?? [],
          rewards: json.rewards ?? {
            referrerPoints: 500,
            refereePoints: 200,
          },
        },
      });
    } catch {
      setState({
        status: "error",
        message: "Network error. Try again.",
      });
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, [load]);

  const onCopy = async (fullUrl: string) => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(fullUrl);
      ok = true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = fullUrl;
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

  if (state.status === "loading") {
    return (
      <div className="screen-anim" style={{ width: "100%" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={h1Style}>Refer &amp; Earn Points</h1>
          <p style={subStyle}>Loading your link…</p>
        </div>
        <div style={{ display: "grid", placeItems: "center", padding: 48 }}>
          <Loader2
            size={28}
            color="var(--blue-electric)"
            className="animate-spin"
            aria-label="Loading"
          />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="screen-anim" style={{ width: "100%" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={h1Style}>Refer &amp; Earn Points</h1>
          <p style={subStyle}>{state.message}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="quote-tap"
          style={retryBtnStyle}
        >
          Try again
        </button>
      </div>
    );
  }

  const { data } = state;
  const host =
    typeof window !== "undefined" ? window.location.host : "www.screwitpro.com";
  const displayLink = `${host}${data.path}`;
  const fullUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${data.path}`
      : `https://${displayLink}`;
  const refPts = data.rewards.referrerPoints;
  const friendPts = data.rewards.refereePoints;
  const friends = data.friendsJoined;
  // Ring: soft progress aesthetic (no fake cap) — full after first friend
  const ringPct = friends <= 0 ? 0 : Math.min(100, 40 + friends * 20);

  const steps = [
    {
      icon: Send,
      title: "Share your link",
      body: "Send it to a friend by text, email, or social.",
    },
    {
      icon: UserPlus,
      title: "They join ScrewIt",
      body: `Your friend gets ${friendPts} points when they create an account.`,
    },
    {
      icon: Wallet,
      title: `You earn ${refPts} points`,
      body: "Points land in your balance the moment they sign up.",
    },
  ] as const;

  return (
    <div className="screen-anim" style={{ width: "100%" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={h1Style}>Refer &amp; Earn Points</h1>
        <p style={subStyle}>
          Share your link — friends get {friendPts} pts, you get {refPts} pts
          when they join.
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={heroCardStyle}>
          <div style={heroGradientStyle}>
            <div style={heroIconTileStyle}>
              <Gift size={28} color="#fff" aria-hidden />
            </div>
            <div style={heroTitleStyle}>
              Give {friendPts} pts, get {refPts} pts
            </div>
            <p style={heroSubStyle}>
              Everyone you refer gets {friendPts} welcome points. You earn{" "}
              {refPts} points the moment they sign up. (Redemption for dollars
              comes later.)
            </p>
            <div style={linkRowStyle}>
              <div style={linkBoxStyle} title={displayLink}>
                {displayLink}
              </div>
              <button
                type="button"
                onClick={() => void onCopy(fullUrl)}
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
            {steps.map((step, i) => (
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
          <div
            style={{
              ...cardStyle,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                ...ringOuterStyle,
                background: `conic-gradient(var(--blue-electric) 0% ${ringPct}%, var(--gray-100) ${ringPct}% 100%)`,
              }}
              aria-hidden
            >
              <div style={ringInnerStyle}>
                {friends > 0 ? String(friends) : "0"}
              </div>
            </div>
            <div>
              <div style={{ ...capsStyle, marginBottom: 3 }}>
                Points balance
              </div>
              <div style={creditAmountStyle}>
                {data.pointsBalance.toLocaleString()} pts
              </div>
              <div style={creditNoteStyle}>
                {friends === 0
                  ? "No friends joined yet — share your link"
                  : `${friends} friend${friends === 1 ? "" : "s"} joined`}
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div style={{ ...capsStyle, marginBottom: 10 }}>Recent</div>
            {data.recent.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: 13.5,
                  color: "var(--ink-500)",
                  lineHeight: 1.5,
                }}
              >
                When a friend signs up with your link, they&apos;ll show up
                here with your points earned.
              </p>
            ) : (
              data.recent.map((ref, i) => (
                <div
                  key={ref.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "7px 0",
                    borderTop: i > 0 ? "1px solid var(--gray-100)" : "none",
                  }}
                >
                  <span style={refAvatarStyle}>{ref.name[0] ?? "?"}</span>
                  <span style={refNameStyle}>{ref.name}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "var(--status-success)",
                    }}
                  >
                    +{ref.points} pts
                  </span>
                </div>
              ))
            )}
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

const retryBtnStyle: CSSProperties = {
  height: 44,
  padding: "0 18px",
  borderRadius: 10,
  border: "none",
  background: "var(--blue-deep)",
  color: "#fff",
  fontFamily: "var(--font-body)",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
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
