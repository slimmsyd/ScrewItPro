import type { Metadata } from "next";
import Link from "next/link";
import AccountPageShell from "@/components/account/AccountPageShell";
import { QUOTE_PATH } from "@/lib/site";

export const metadata: Metadata = {
  title: "My Jobs | ScrewIt Pros",
  robots: { index: false, follow: false },
};

/**
 * My Jobs list — shell only for now (silo after expanded account menu).
 * Demo link into existing tracker so the menu path is walkable end-to-end.
 */
export default function JobsPage() {
  return (
    <AccountPageShell>
      <main
        className="screen-anim"
        style={{
          flex: 1,
          padding: "32px 24px 56px",
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--blue-deep)",
          }}
        >
          My Jobs
        </h1>
        <p
          style={{
            margin: "8px 0 28px",
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--ink-500)",
            lineHeight: 1.5,
          }}
        >
          Active and past builds will list here. For now you can open the demo
          tracker or start a new quote.
        </p>

        <Link
          href="/orders/SIP-4471/track"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: 18,
            borderRadius: 14,
            border: "1px solid var(--border-default)",
            background: "#fff",
            textDecoration: "none",
            boxShadow: "0 8px 24px -16px rgba(4, 32, 155, 0.18)",
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--ink-300)",
              }}
            >
              Demo order
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--blue-deep)",
                marginTop: 4,
              }}
            >
              #SIP-4471
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--ink-500)",
                marginTop: 4,
              }}
            >
              HEMNES 8-drawer dresser · Track progress
            </div>
          </div>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--status-success)",
              background: "var(--status-success-bg)",
              borderRadius: 999,
              padding: "6px 12px",
              whiteSpace: "nowrap",
            }}
          >
            Booked
          </span>
        </Link>

        <Link
          href={QUOTE_PATH}
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: 48,
            padding: "0 22px",
            borderRadius: 12,
            background: "var(--blue-deep)",
            color: "#fff",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 15,
            textDecoration: "none",
            marginTop: 16,
          }}
        >
          Get another quote
        </Link>
      </main>
    </AccountPageShell>
  );
}
