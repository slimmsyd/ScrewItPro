import { notFound } from "next/navigation";
import DemoResetClient from "./DemoResetClient";

/**
 * /dev/demo-reset — clear quote draft + booked snapshot for client walkthroughs.
 * Dev/preview only: 404 in production (same pattern as /dev/emails).
 */
export const dynamic = "force-dynamic";

export default function DemoResetPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DemoResetClient />;
}
