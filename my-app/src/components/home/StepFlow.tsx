"use client";

import { Truck } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

type Step = { title: string; body: string };

function Bubble({ i }: { i: number }) {
  return (
    <div
      style={{
        flex: "none",
        width: 48,
        height: 48,
        borderRadius: "50%",
        background:
          "linear-gradient(135deg, var(--blue-electric), var(--blue-deep))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 8px 20px -8px rgba(29,110,254,0.7)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 22,
          fontWeight: 700,
          color: "var(--white)",
        }}
      >
        {i + 1}
      </span>
    </div>
  );
}

/**
 * Lugg-style four-step flow. Desktop: horizontal columns with a snaking SVG
 * connector and a traveling van (animated via .flow-van in globals.css).
 * Mobile: vertical gradient rail.
 */
export default function StepFlow({ steps }: { steps: Step[] }) {
  const mobile = useIsMobile();
  const n = steps.length;

  if (mobile) {
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 23,
            top: 24,
            bottom: 24,
            width: 3,
            borderRadius: 999,
            background:
              "linear-gradient(var(--blue-electric), rgba(29,110,254,0.12))",
            opacity: 0.5,
          }}
        />
        {steps.map((s, i) => (
          <div
            key={s.title}
            style={{
              position: "relative",
              display: "flex",
              gap: 18,
              alignItems: "flex-start",
            }}
          >
            <Bubble i={i} />
            <div style={{ paddingTop: 2 }}>
              <h4
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 19,
                  fontWeight: 700,
                  color: "var(--text-heading)",
                  margin: "0 0 6px",
                }}
              >
                {s.title}
              </h4>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 15.5,
                  lineHeight: "var(--leading-body)",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        marginTop: "15%",
      }}
    >
      {/* Sharp industrial connector + traveling van */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "11%",
          right: "11%",
          top: 6,
          height: 70,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg
          viewBox="0 0 1000 70"
          preserveAspectRatio="none"
          width="100%"
          height="70"
          fill="none"
        >
          <path
            d="M0 6 H232 Q250 6 250 24 V46 Q250 64 268 64 H482 Q500 64 500 46 V24 Q500 6 518 6 H732 Q750 6 750 24 V46 Q750 64 768 64 H1000"
            stroke="url(#flowgrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
          <defs>
            <linearGradient
              id="flowgrad"
              x1="0"
              y1="0"
              x2="1000"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--blue-electric)" stopOpacity="0" />
              <stop offset="0.85" stopColor="var(--blue-electric)" />
            </linearGradient>
          </defs>
        </svg>
        <div
          className="flow-van"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "translateX(-50%)",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--white)",
              border: "1px solid var(--blue-100)",
              boxShadow: "0 8px 22px -6px rgba(11,16,48,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Truck size={22} color="var(--blue-electric)" aria-hidden />
          </div>
        </div>
      </div>

      {/* Step columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${n}, 1fr)`,
          gap: 28,
          position: "relative",
          zIndex: 1,
          paddingTop: 12,
        }}
      >
        {steps.map((s, i) => (
          <div key={s.title}>
            <div style={{ marginBottom: 20 }}>
              <Bubble i={i} />
            </div>
            <h4
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 21,
                fontWeight: 700,
                color: "var(--text-heading)",
                margin: "0 0 10px",
              }}
            >
              {s.title}
            </h4>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15.5,
                lineHeight: "var(--leading-body)",
                color: "var(--text-muted)",
                margin: 0,
                maxWidth: "30ch",
              }}
            >
              {s.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
