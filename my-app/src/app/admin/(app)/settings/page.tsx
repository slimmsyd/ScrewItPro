import type { Metadata } from "next";
import SettingsView from "@/components/admin/SettingsView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings · Admin",
  robots: { index: false, follow: false },
};

/**
 * /admin/settings - ops rules. Deposit + hub persist via API;
 * remaining kit cards are progressive UI only.
 */
export default function AdminSettingsPage() {
  return <SettingsView />;
}
