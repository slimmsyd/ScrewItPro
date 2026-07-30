import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConfirmationShell from "@/components/portal/ConfirmationShell";
import ConfirmationPanel from "@/components/orders/ConfirmationPanel";
import { getMockOrder } from "@/lib/orders";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = getMockOrder(id);
  if (!order) return { title: "Order not found" };
  return { title: `Order #${order.id}` };
}

/**
 * Step 5 — post-book confirmation ("You're booked!").
 * Design: /orders/SIP-4471
 * ?demo=1 — continued from quote soft-gate without Stripe deposit.
 */
export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { id } = await params;
  const { demo } = await searchParams;
  const order = getMockOrder(id);
  if (!order) notFound();

  return (
    <ConfirmationShell>
      <ConfirmationPanel order={order} isDemo={demo === "1"} />
    </ConfirmationShell>
  );
}
