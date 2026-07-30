"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  BOOKED_SNAPSHOT_KEY,
  listActiveJobs,
  listPastJobs,
  loadBookedSnapshot,
  primaryActiveJob,
} from "@/lib/orders";
import { QUOTE_DRAFT_KEY, loadQuoteDraft } from "@/lib/quote/draft-storage";
import { resetPortalDemoState } from "@/lib/demo/resetDemoState";
import { JOIN_PATH, QUOTE_PATH } from "@/lib/site";

/**
 * Client UI — gated by server page (404 in production).
 * Local/demo helper — clear quote draft + booked snapshot before a client walkthrough.
 * Mock jobs (SIP-*) are code fixtures and always come back; this only resets browser state.
 */
export default function DemoResetClient() {
  const [quoteItems, setQuoteItems] = useState(0);
  const [snapId, setSnapId] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    const draft = loadQuoteDraft();
    setQuoteItems(draft.items?.length ?? 0);
    const snap = loadBookedSnapshot();
    setSnapId(snap?.orderId ?? null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, tick]);

  const onReset = () => {
    resetPortalDemoState();
    setCleared(true);
    setTick((t) => t + 1);
  };

  const active = listActiveJobs();
  const past = listPastJobs();
  const hero = primaryActiveJob();

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--gray-50)",
        fontFamily: "var(--font-body)",
        padding: "40px 24px 64px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-300)",
          }}
        >
          Dev · client demo
        </p>
        <h1
          style={{
            margin: "8px 0 0",
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 400,
            color: "var(--blue-deep)",
            letterSpacing: "-0.02em",
          }}
        >
          Reset demo state
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 15,
            color: "var(--ink-500)",
            lineHeight: 1.55,
          }}
        >
          Clears the in-browser quote draft and booked snapshot so soft-gate
          booking starts clean. Mock jobs below are fixtures in code — they always
          reload the same way.
        </p>

        <section style={card}>
          <h2 style={h2}>Browser state</h2>
          <ul style={list}>
            <li>
              <code>{QUOTE_DRAFT_KEY}</code> —{" "}
              {quoteItems > 0
                ? `${quoteItems} item(s) in draft`
                : "empty"}
            </li>
            <li>
              <code>{BOOKED_SNAPSHOT_KEY}</code> —{" "}
              {snapId ? `snapshot for ${snapId}` : "empty"}
            </li>
          </ul>
          <button type="button" onClick={onReset} style={primaryBtn}>
            Clear quote + booked snapshot
          </button>
          {cleared && (
            <p role="status" style={{ margin: "12px 0 0", color: "var(--status-success)", fontWeight: 600, fontSize: 14 }}>
              Cleared. Soft-gate book will write a fresh snapshot to SIP-4471.
            </p>
          )}
        </section>

        <section style={card}>
          <h2 style={h2}>Fixture jobs (this “account”)</h2>
          <p style={{ margin: "0 0 12px", fontSize: 14, color: "var(--ink-500)" }}>
            Primary hero for a future dashboard:{" "}
            <strong style={{ color: "var(--blue-deep)" }}>
              {hero ? `${hero.id} · ${hero.status}` : "none"}
            </strong>
          </p>
          <p style={label}>Active ({active.length})</p>
          <ul style={list}>
            {active.map((j) => (
              <li key={j.id}>
                <Link href={`/orders/${j.id}/track`} style={link}>
                  {j.id}
                </Link>{" "}
                — {j.items[0]?.name ?? "Job"} · {j.status}
              </li>
            ))}
          </ul>
          <p style={{ ...label, marginTop: 14 }}>Past ({past.length})</p>
          <ul style={list}>
            {past.map((j) => (
              <li key={j.id}>
                <Link href={`/orders/${j.id}/track`} style={link}>
                  {j.id}
                </Link>{" "}
                — {j.items[0]?.name ?? "Job"} · delivered
              </li>
            ))}
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}>Client walkthrough (suggested order)</h2>
          <ol style={{ ...list, listStyle: "decimal", paddingLeft: 20 }}>
            <li>
              <strong>Reset</strong> (button above) — clean slate
            </li>
            <li>
              <Link href={QUOTE_PATH} style={link}>
                Get a Price
              </Link>{" "}
              — Where → Items → Price → soft-gate Continue
            </li>
            <li>
              <Link href="/orders/SIP-4471?demo=1" style={link}>
                Confirmation
              </Link>{" "}
              — confetti “You’re booked” (after book, or open direct)
            </li>
            <li>
              <Link href="/orders/SIP-4471/track" style={link}>
                Track SIP-4471
              </Link>{" "}
              — portal sidebar (fresh book = Booked)
            </li>
            <li>
              <Link href="/orders/SIP-WORK/track" style={link}>
                Track SIP-WORK
              </Link>{" "}
              — workshop progress parity for “deeper in pipeline”
            </li>
            <li>
              <Link href="/jobs" style={link}>
                My Jobs
              </Link>{" "}
              ·{" "}
              <Link href="/account" style={link}>
                Account tabs
              </Link>{" "}
              — customer silo chrome
            </li>
            <li>
              <Link href={JOIN_PATH} style={link}>
                Sign in
              </Link>{" "}
              if Account shows empty (soft gate, not hard auth)
            </li>
          </ol>
          <p style={{ margin: "16px 0 0", fontSize: 13, color: "var(--ink-500)", lineHeight: 1.5 }}>
            Talking points: quote soft-gate without Stripe · full-page confirmation ·
            tracker in portal shell (no marketing nav) · Account Profile / Addresses /
            Payment UI · Dashboard still next.
          </p>
        </section>

        <p style={{ marginTop: 20, fontSize: 13, color: "var(--ink-300)" }}>
          <Link href="/" style={link}>
            ← Marketing home
          </Link>
        </p>
      </div>
    </main>
  );
}

const card: CSSProperties = {
  background: "#fff",
  border: "1px solid var(--border-default)",
  borderRadius: 14,
  padding: 20,
  marginTop: 18,
};

const h2: CSSProperties = {
  margin: "0 0 12px",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  fontWeight: 800,
  color: "var(--blue-deep)",
};

const label: CSSProperties = {
  margin: "0 0 6px",
  fontSize: 11.5,
  fontWeight: 800,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--ink-300)",
};

const list: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  fontSize: 14,
  color: "var(--ink-700)",
  lineHeight: 1.65,
};

const link: CSSProperties = {
  color: "var(--blue-electric)",
  fontWeight: 600,
  textDecoration: "none",
};

const primaryBtn: CSSProperties = {
  marginTop: 14,
  height: 44,
  minHeight: 44,
  padding: "0 18px",
  borderRadius: 12,
  border: "1px solid var(--blue-deep)",
  background: "var(--blue-deep)",
  color: "#fff",
  fontFamily: "var(--font-body)",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  boxShadow: "0 8px 20px -8px rgba(4, 32, 155, 0.5)",
};
