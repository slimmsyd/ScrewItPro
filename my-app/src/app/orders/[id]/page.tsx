import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OrdersShell from "@/components/orders/OrdersShell";
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
 */
export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getMockOrder(id);
  if (!order) notFound();

  return (
    <OrdersShell>
      <ConfirmationPanel order={order} />
    </OrdersShell>
  );
}
