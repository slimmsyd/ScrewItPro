import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ConfirmationShell from "@/components/portal/ConfirmationShell";
import ConfirmationPanel from "@/components/orders/ConfirmationPanel";
import { getMockOrder, type MockOrder } from "@/lib/orders";
import { getCustomerJob } from "@/lib/orders/customer-jobs";
import { createClient } from "@/lib/supabase/server";

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

  const order = await resolveConfirmationOrder(id);
  if (!order) notFound();

  return (
    <ConfirmationShell>
      <ConfirmationPanel order={order} isDemo={isDemo} />
    </ConfirmationShell>
  );
}

async function resolveConfirmationOrder(
  id: string
): Promise<MockOrder | null> {
  const mock = getMockOrder(id);
  if (mock) return mock;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) return null;

    const { job } = await getCustomerJob(supabase, user.id, id);
    return job;
  } catch {
    return null;
  }
}
