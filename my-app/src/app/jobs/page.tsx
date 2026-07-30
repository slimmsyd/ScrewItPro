import type { Metadata } from "next";
import AccountPageShell from "@/components/account/AccountPageShell";
import MyJobsView from "@/components/portal/MyJobsView";

export const metadata: Metadata = {
  title: "My Jobs | ScrewIt Pros",
  robots: { index: false, follow: false },
};

/**
 * My Jobs silo — Active/Past rich rows from the portal-jobs seam.
 * 940px cap matches the design frame's main-region content width.
 */
export default function JobsPage() {
  return (
    <AccountPageShell>
      <div style={{ maxWidth: 940, margin: "0 auto", width: "100%" }}>
        <MyJobsView />
      </div>
    </AccountPageShell>
  );
}
