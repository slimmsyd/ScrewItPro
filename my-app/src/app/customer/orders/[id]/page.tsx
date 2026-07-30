import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConfirmationShell from "@/components/portal/ConfirmationShell";
import ConfirmationPanel from "@/components/orders/ConfirmationPanel";
import { getMockOrder } from "@/lib/orders";
import { resolvePortalOrder } from "@/lib/orders/resolve-portal-order";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mock = getMockOrder(id);
  if (mock) return { title: `Order #${mock.id}` };
  return { title: `Order #${id}` };
}

/**
 * Step 5 — post-book confirmation ("You're booked!").
 * Resolves fixture mock OR real customer job (soft-gate / future Stripe book).
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
  const isDemo = demo === "1";

  const order = await resolvePortalOrder(id);
  if (!order) notFound();

  return (
    <ConfirmationShell>
      <ConfirmationPanel order={order} isDemo={isDemo} />
    </ConfirmationShell>
  );
}
