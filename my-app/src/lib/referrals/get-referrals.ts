import { createAdminClient } from "@/lib/supabase/admin";
import {
  REFEREE_POINTS_ON_SIGNUP,
  REFERRER_POINTS_ON_SIGNUP,
} from "./config";
import { referralDisplayName } from "./display";
import { ensureUserReferralCode } from "./ensure-code";
import type { ReferralRecentItem, ReferralsPayload } from "./types";

/**
 * Load portal referrals payload for a signed-in user (service role for joins).
 */
export async function getReferralsForUser(
  userId: string
): Promise<ReferralsPayload> {
  const code = await ensureUserReferralCode(userId);
  const admin = createAdminClient();

  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("points_balance")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) {
    throw new Error(`referrals_profile: ${profileErr.message}`);
  }

  const pointsBalance = Number(profile?.points_balance ?? 0);

  const { data: plain, error: plainErr } = await admin
    .from("referral_attributions")
    .select("id, referee_id, referrer_points, created_at")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (plainErr) {
    throw new Error(`referrals_attributions: ${plainErr.message}`);
  }

  const recent: ReferralRecentItem[] = [];
  for (const r of plain ?? []) {
    const { data: ref } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", r.referee_id as string)
      .maybeSingle();
    recent.push({
      id: r.id as string,
      name: referralDisplayName({
        fullName: (ref?.full_name as string | null) ?? null,
        email: (ref?.email as string | null) ?? null,
      }),
      points: Number(r.referrer_points ?? 0),
      createdAt: r.created_at as string,
    });
  }

  return {
    code,
    path: `/r/${code}`,
    pointsBalance,
    friendsJoined: recent.length,
    recent,
    rewards: {
      referrerPoints: REFERRER_POINTS_ON_SIGNUP,
      refereePoints: REFEREE_POINTS_ON_SIGNUP,
    },
  };
}
