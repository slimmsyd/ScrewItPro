import {
  REFERRAL_COOKIE,
  REFERRAL_COOKIE_MAX_AGE_SEC,
} from "./config";
import { normalizeReferralCode } from "./codes";

export function referralCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: REFERRAL_COOKIE_MAX_AGE_SEC,
  };
}

export function clearReferralCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 0,
  };
}

export function parseReferralCookie(
  raw: string | undefined | null
): string | null {
  return normalizeReferralCode(raw ?? null);
}

export { REFERRAL_COOKIE };
