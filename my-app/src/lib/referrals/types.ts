export type ClaimReferralResult =
  | {
      ok: true;
      attributionId: string;
      referrerId: string;
      referrerPoints: number;
      refereePoints: number;
    }
  | {
      ok: false;
      error:
        | "invalid_code"
        | "referee_not_found"
        | "already_attributed"
        | "code_not_found"
        | "self_referral"
        | "referrer_inactive"
        | "claim_failed";
    };

export type ReferralRecentItem = {
  id: string;
  /** Display label for the referee (first name or masked email). */
  name: string;
  points: number;
  createdAt: string;
};

export type ReferralsPayload = {
  code: string;
  /** Path-only link, e.g. /r/SIP7K2M9A — client prefixes origin for copy. */
  path: string;
  pointsBalance: number;
  friendsJoined: number;
  recent: ReferralRecentItem[];
  rewards: {
    referrerPoints: number;
    refereePoints: number;
  };
};
