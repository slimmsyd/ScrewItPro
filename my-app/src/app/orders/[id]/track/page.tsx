import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrdersShell from "@/components/orders/OrdersShell";
import TrackOrderView from "@/components/orders/TrackOrderView";
import { getMockOrder } from "@/lib/orders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = getMockOrder(id);
  if (!order) return { title: "Track order" };
  return { title: `Track #${order.id}` };
}

/**
 * Step 6 — customer order tracker (7-status timeline).
 * Order Summary reads booked snapshot (IKEA imageUrl) when present.
 */
export default async function OrderTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getMockOrder(id);
  if (!order) notFound();

  return (
    <OrdersShell>
      <TrackOrderView baseOrder={order} />
    </OrdersShell>
  );
}
