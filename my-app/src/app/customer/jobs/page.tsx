import type { Metadata } from "next";
import { Suspense } from "react";
import AccountPageShell from "@/components/account/AccountPageShell";
import MyJobsView from "@/components/portal/MyJobsView";

export const metadata: Metadata = {
  title: "My Jobs | ScrewIt Pros",
  robots: { index: false, follow: false },
};

/**
 * My Jobs silo — Active/Past rich rows.
 * Phase C2: real DB via GET /api/customer/jobs; ?demo=1 for fixtures.
 * 940px cap matches the design frame's main-region content width.
 */
export default function JobsPage() {
  return (
    <AccountPageShell>
      <div style={{ maxWidth: 940, margin: "0 auto", width: "100%" }}>
        <Suspense
          fallback={
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: 14.5,
                color: "var(--ink-500)",
              }}
            >
              Loading your jobs…
            </p>
          }
        >
          <MyJobsView />
        </Suspense>
      </div>
    </AccountPageShell>
  );
}
