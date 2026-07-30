import { createAdminClient } from "@/lib/supabase/admin";
import { generateReferralCode } from "./codes";

const MAX_ATTEMPTS = 8;

/**
 * Ensure the user has an opaque referral_code. Lazy assignment on first read.
 * Server-only (service role RPC).
 */
export async function ensureUserReferralCode(userId: string): Promise<string> {
  const admin = createAdminClient();

  const { data: existing, error: readErr } = await admin
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .maybeSingle();

  if (readErr) {
    throw new Error(`ensure_code_read_failed: ${readErr.message}`);
  }
  if (existing?.referral_code) {
    return existing.referral_code as string;
  }

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const candidate = generateReferralCode();
    const { data, error } = await admin.rpc("ensure_referral_code", {
      p_user_id: userId,
      p_code: candidate,
    });

    if (!error && typeof data === "string" && data.length > 0) {
      return data;
    }

    // Unique race on code — retry with a new candidate
    if (error?.code === "23505" || error?.message?.includes("unique")) {
      continue;
    }
    if (error) {
      throw new Error(`ensure_code_rpc_failed: ${error.message}`);
    }
  }

  throw new Error("ensure_code_exhausted_retries");
}
