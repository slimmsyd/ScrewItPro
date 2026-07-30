import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CustomerAppShell from "@/components/portal/CustomerAppShell";
import TrackOrderView from "@/components/orders/TrackOrderView";
import { getMockOrder } from "@/lib/orders";
import { resolvePortalOrder } from "@/lib/orders/resolve-portal-order";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mock = getMockOrder(id);
  if (mock) return { title: `Track #${mock.id}` };
  return { title: `Track #${id}` };
}

/**
 * Step 6 — customer order tracker (7-status timeline).
 * Resolves fixture mock OR real customer job (same as confirmation).
 */
export default async function OrderTrackPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await resolvePortalOrder(id);
  if (!order) notFound();

  return (
    <CustomerAppShell fullBleed>
      <TrackOrderView baseOrder={order} />
    </CustomerAppShell>
  );
}
