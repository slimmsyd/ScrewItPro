import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeReferralCode } from "./codes";
import type { ClaimReferralResult } from "./types";

/**
 * Claim a referral for a newly signed-up user using the cookie/query code.
 * Server-only. Idempotent: already_attributed is a soft no-op.
 */
export async function claimReferral(opts: {
  refereeUserId: string;
  code: string | null | undefined;
}): Promise<ClaimReferralResult> {
  const code = normalizeReferralCode(opts.code ?? null);
  if (!code) {
    return { ok: false, error: "invalid_code" };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "claim_failed" };
  }

  const { data, error } = await admin.rpc("claim_referral", {
    p_referee_id: opts.refereeUserId,
    p_code: code,
  });

  if (error) {
    console.error("[referrals/claim]", error.message);
    return { ok: false, error: "claim_failed" };
  }

  const row = data as Record<string, unknown> | null;
  if (!row || typeof row !== "object") {
    return { ok: false, error: "claim_failed" };
  }

  if (row.ok === true) {
    return {
      ok: true,
      attributionId: String(row.attributionId ?? ""),
      referrerId: String(row.referrerId ?? ""),
      referrerPoints: Number(row.referrerPoints ?? 0),
      refereePoints: Number(row.refereePoints ?? 0),
    };
  }

  const err = String(row.error ?? "claim_failed");
  const allowed = [
    "invalid_code",
    "referee_not_found",
    "already_attributed",
    "code_not_found",
    "self_referral",
    "referrer_inactive",
  ] as const;
  if ((allowed as readonly string[]).includes(err)) {
    return { ok: false, error: err as (typeof allowed)[number] };
  }
  return { ok: false, error: "claim_failed" };
}

/**
 * Soft claim: logs non-success outcomes; never throws (auth paths must stay open).
 */
export async function tryClaimReferralFromCode(
  refereeUserId: string,
  code: string | null | undefined
): Promise<void> {
  if (!code) return;
  const result = await claimReferral({ refereeUserId, code });
  if (result.ok) {
    console.info(
      `[referrals] claimed for referee=${refereeUserId} +${result.referrerPoints}/${result.refereePoints}`
    );
    return;
  }
  if (
    result.error === "already_attributed" ||
    result.error === "invalid_code" ||
    result.error === "code_not_found" ||
    result.error === "self_referral"
  ) {
    // Expected no-ops — no log noise beyond debug
    return;
  }
  console.warn(`[referrals] claim skipped: ${result.error}`);
}
