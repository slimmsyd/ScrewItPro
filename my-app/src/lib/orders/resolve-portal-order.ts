/**
 * Resolve a portal order for confirmation / tracker pages.
 * Prefer design fixtures, then the signed-in user's real job (C2/C2.5).
 */
import type { MockOrder } from "./types";
import { getMockOrder } from "./mock-order";
import { getCustomerJob } from "./customer-jobs";
import { createClient } from "@/lib/supabase/server";

export async function resolvePortalOrder(
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
