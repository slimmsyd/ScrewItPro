/**
 * Refer & Earn Points — product constants.
 * Dollar conversion is intentionally out of scope; points are the unit of record.
 */

/** Opaque code prefix (not vanity usernames). */
export const REFERRAL_CODE_PREFIX = "SIP";

/** Alphabet without ambiguous 0/O/1/I. */
export const REFERRAL_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Random segment length after prefix. */
export const REFERRAL_CODE_BODY_LEN = 7;

/** Cookie holding pending attribution code until signup. */
export const REFERRAL_COOKIE = "sip_ref";

/** Cookie max-age: 30 days. */
export const REFERRAL_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30;

/**
 * Points awarded when a friend signs up via your link (referrer).
 * Must stay in sync with claim_referral defaults in the SQL migration
 * until amounts are moved to app_settings.
 */
export const REFERRER_POINTS_ON_SIGNUP = 500;

/** Points awarded to the new member who used a referral link. */
export const REFEREE_POINTS_ON_SIGNUP = 200;
