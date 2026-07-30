import { createAdminClient } from "@/lib/supabase/admin";
import { isInquiryBackendReady } from "@/lib/inquiries";

/**
 * Admin lead data for /admin/leads.
 * Access is gated by requireAdmin() (profiles.role = admin) — not a URL token.
 *
 * Bootstrap first admin (SQL editor):
 *   update public.profiles set role = 'admin' where email = 'you@example.com';
 */

export type LeadRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  service: string | null;
  message: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
};

export type WaitlistRow = {
  id: string;
  name: string | null;
  email: string;
  provider: string | null;
  source: string | null;
  created_at: string;
};

export async function fetchInquiries(limit = 500): Promise<LeadRow[]> {
  if (!isInquiryBackendReady()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("id, name, email, phone, service, message, source, status, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[admin/leads] inquiries", error.message);
    return [];
  }
  return (data ?? []) as LeadRow[];
}

export async function fetchWaitlist(limit = 500): Promise<WaitlistRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("waitlist_entries")
    .select("id, name, email, provider, source, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[admin/leads] waitlist", error.message);
    return [];
  }
  return (data ?? []) as WaitlistRow[];
}

/** Serialize rows to CSV (RFC-4180-ish quoting). */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(",");
  const body = rows
    .map((r) => columns.map((c) => escape(r[c])).join(","))
    .join("\n");
  return `${header}\n${body}`;
}
