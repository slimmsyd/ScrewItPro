"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  Archive,
  ArrowRight,
  BedDouble,
  Library,
  Package,
} from "lucide-react";
import type { MockOrder } from "@/lib/orders";
import {
  ORDER_STATUS_META,
  ORDER_STATUS_ORDER,
  formatCents,
  jobTotalCents,
  listActiveJobs as listFixtureActiveJobs,
  listPastJobs as listFixturePastJobs,
  portalTrackHref,
  segmentActiveJobs,
  segmentPastJobs,
  statusIndex,
} from "@/lib/orders";
import JobStatusPill from "./JobStatusPill";

/**
 * My Jobs — design_handoff_portal locked "rich rows" layout (V3):
 * Active/Past segmented toggle, one card row per job with inline
 * 7-step progress.
 *
 * Phase C2: loads real rows from GET /api/customer/jobs.
 * Fixtures only when ?demo=1 (design walkthrough).
 */

const TILE_ICONS = { Archive, BedDouble, Library, Package } as const;

type Segment = "active" | "past";
type LoadState = "loading" | "ready" | "error";

export default function MyJobsView() {
  const searchParams = useSearchParams();
  const demoMode = searchParams.get("demo") === "1";

  const [segment, setSegment] = useState<Segment>("active");
  const [jobs, setJobs] = useState<MockOrder[]>([]);
  const [loadState, setLoadState] = useState<LoadState>(
    demoMode ? "ready" : "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    if (demoMode) {
      setJobs([]);
      setLoadState("ready");
      setErrorMessage(null);
      return;
    }

    setLoadState("loading");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/customer/jobs", {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      });
      const data = (await res.json()) as {
        ok?: boolean;
        jobs?: MockOrder[];
        error?: string;
        message?: string;
      };

      if (res.status === 401) {
        setJobs([]);
        setLoadState("error");
        setErrorMessage("Sign in to view your jobs.");
        return;
      }

      if (!res.ok || !data.ok || !Array.isArray(data.jobs)) {
        setJobs([]);
        setLoadState("error");
        setErrorMessage(
          data.message ?? "Could not load jobs. Try again."
        );
        return;
      }

      setJobs(data.jobs);
      setLoadState("ready");
    } catch {
      setJobs([]);
      setLoadState("error");
      setErrorMessage("Could not load jobs. Check your connection.");
    }
  }, [demoMode]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  const active = demoMode ? listFixtureActiveJobs() : segmentActiveJobs(jobs);
  const past = demoMode ? listFixturePastJobs() : segmentPastJobs(jobs);
  const list = segment === "active" ? active : past;

  return (
    <div className="screen-anim" style={{ width: "100%" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={h1Style}>My Jobs</h1>
        <p style={subStyle}>
          Every build you&rsquo;ve booked with us.
          {demoMode ? (
            <span style={{ color: "var(--ink-300)" }}> (demo fixtures)</span>
          ) : null}
        </p>
      </div>

      <div style={segmentWrapStyle}>
        {(
          [
            ["active", "Active", active.length],
            ["past", "Past", past.length],
          ] as const
        ).map(([key, label, count]) => {
          const on = segment === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => setSegment(key)}
              className="jobs-segment-btn"
              style={{
                ...segmentBtnStyle,
                background: on ? "var(--blue-deep)" : "transparent",
                color: on ? "#fff" : "var(--ink-500)",
              }}
            >
              {label} <span style={{ opacity: 0.7 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {loadState === "loading" && (
        <div style={{ ...cardStyle, justifyContent: "center" }}>
          <p style={emptyStyle}>Loading your jobs…</p>
        </div>
      )}

      {loadState === "error" && (
        <div style={{ ...cardStyle, justifyContent: "center", flexDirection: "column", gap: 12 }}>
          <p style={emptyStyle}>{errorMessage ?? "Something went wrong."}</p>
          <button type="button" onClick={() => void loadJobs()} style={retryBtnStyle}>
            Try again
          </button>
        </div>
      )}

      {loadState === "ready" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {list.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
          {list.length === 0 && (
            <div style={{ ...cardStyle, justifyContent: "center" }}>
              <p style={emptyStyle}>
                {segment === "active"
                  ? "No active jobs — start a new quote to book your next build."
                  : "No past jobs yet."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobRow({ job }: { job: MockOrder }) {
  const activeJob = job.status !== "delivered";
  const step = statusIndex(job.status);
  const Icon = TILE_ICONS[job.iconName ?? "Package"];
  const item = job.items[0];

  return (
    <div style={cardStyle}>
      <div style={tileStyle}>
        <Icon size={25} color="var(--blue-electric)" aria-hidden />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={rowHeadStyle}>
          <span style={itemNameStyle}>{item?.name ?? "Your build"}</span>
          <span style={rowMetaStyle}>
            #{job.id}
            {job.bookedAtLabel ? ` · ${job.bookedAtLabel}` : ""}
          </span>
          <span style={{ marginLeft: "auto" }}>
            <JobStatusPill status={job.status} small />
          </span>
        </div>

        <MiniTrack step={step} />

        <div style={trackMetaStyle}>
          <span>{ORDER_STATUS_META[job.status].label}</span>
          <span>
            Step {step + 1} of {ORDER_STATUS_ORDER.length}
          </span>
        </div>
      </div>

      <div style={{ textAlign: "right", flex: "0 0 auto" }}>
        <div style={totalStyle}>{formatCents(jobTotalCents(job))}</div>
        <Link
          href={portalTrackHref(job.id)}
          className="jobs-row-cta"
          style={{
            ...ctaStyle,
            border: `1px solid ${
              activeJob ? "var(--blue-deep)" : "var(--border-default)"
            }`,
            background: activeJob ? "var(--blue-deep)" : "#fff",
            color: activeJob ? "#fff" : "var(--blue-deep)",
          }}
        >
          {activeJob ? "Track" : "View"}
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

/** Inline 7-node progress rail — 9px dots, 2px connectors. */
function MiniTrack({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }} aria-hidden>
      {ORDER_STATUS_ORDER.map((status, idx) => (
        <span key={status} style={{ display: "contents" }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              flex: "0 0 auto",
              background:
                idx <= step ? "var(--blue-electric)" : "var(--gray-100)",
            }}
          />
          {idx < ORDER_STATUS_ORDER.length - 1 && (
            <span
              style={{
                flex: 1,
                height: 2,
                background:
                  idx < step ? "var(--blue-electric)" : "var(--gray-100)",
              }}
            />
          )}
        </span>
      ))}
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

const segmentWrapStyle: CSSProperties = {
  display: "flex",
  gap: 6,
  background: "var(--gray-50)",
  border: "1px solid var(--border-default)",
  borderRadius: 11,
  padding: 4,
  width: "fit-content",
  marginBottom: 20,
};

const segmentBtnStyle: CSSProperties = {
  border: "none",
  cursor: "pointer",
  borderRadius: 8,
  padding: "8px 18px",
  fontFamily: "var(--font-body)",
  fontSize: 13.5,
  fontWeight: 700,
};

const cardStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  background: "#fff",
  border: "1px solid var(--border-default)",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 8px 24px -18px rgba(4, 32, 155, 0.12)",
};

const tileStyle: CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 14,
  background: "var(--blue-50)",
  display: "grid",
  placeItems: "center",
  flex: "0 0 56px",
};

const rowHeadStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 8,
  flexWrap: "wrap",
};

const itemNameStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 15.5,
  fontWeight: 700,
  color: "var(--blue-deep)",
};

const rowMetaStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 12,
  color: "var(--ink-300)",
};

const trackMetaStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 7,
  fontFamily: "var(--font-body)",
  fontSize: 12,
  color: "var(--ink-500)",
};

const totalStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 17,
  fontWeight: 800,
  color: "var(--ink-900)",
  marginBottom: 8,
};

const ctaStyle: CSSProperties = {
  height: 36,
  padding: "0 16px",
  borderRadius: 10,
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  textDecoration: "none",
};

const emptyStyle: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-body)",
  fontSize: 14.5,
  color: "var(--ink-500)",
};

const retryBtnStyle: CSSProperties = {
  alignSelf: "center",
  border: "1px solid var(--blue-deep)",
  background: "var(--blue-deep)",
  color: "#fff",
  borderRadius: 10,
  padding: "8px 16px",
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};
