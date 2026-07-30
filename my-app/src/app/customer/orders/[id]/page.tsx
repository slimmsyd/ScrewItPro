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
 * Real DB orders use SIP-xxxxx with no ?demo=1. Query demo=1 is fixture-only.
 */
export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { id } = await params;
  // searchParams.demo kept for old fixture links; ignored for real SIP jobs
  await searchParams;

  const order = await resolvePortalOrder(id);
  if (!order) notFound();

  // Yellow "Demo path" banner only for design fixtures (SIP-4471 etc.), never real DB jobs.
  const isDemo = getMockOrder(id) != null;

  return (
    <ConfirmationShell>
      <ConfirmationPanel order={order} isDemo={isDemo} />
    </ConfirmationShell>
  );
}
