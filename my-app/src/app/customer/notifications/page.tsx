import type { Metadata } from "next";
import NotificationsPageClient from "./NotificationsPageClient";

export const metadata: Metadata = {
  title: "Notifications | ScrewIt Pros",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return <NotificationsPageClient />;
}
