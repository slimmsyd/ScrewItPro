import {
  REFERRAL_CODE_ALPHABET,
  REFERRAL_CODE_BODY_LEN,
  REFERRAL_CODE_PREFIX,
} from "./config";

/**
 * Generate an opaque personal referral code: SIP + random base32 segment.
 * Not vanity / username-based (v1 product decision).
 */
export function generateReferralCode(
  randomBytes: (n: number) => Uint8Array = defaultRandomBytes
): string {
  const bytes = randomBytes(REFERRAL_CODE_BODY_LEN);
  let body = "";
  for (let i = 0; i < REFERRAL_CODE_BODY_LEN; i++) {
    body += REFERRAL_CODE_ALPHABET[bytes[i]! % REFERRAL_CODE_ALPHABET.length];
  }
  return `${REFERRAL_CODE_PREFIX}${body}`;
}

function defaultRandomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  crypto.getRandomValues(buf);
  return buf;
}

/** Normalize user/cookie input for lookup. */
export function normalizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  if (code.length < 6 || code.length > 32) return null;
  if (!/^[A-Z0-9]+$/.test(code)) return null;
  return code;
}

export function isValidReferralCodeFormat(code: string): boolean {
  return (
    code.startsWith(REFERRAL_CODE_PREFIX) &&
    code.length === REFERRAL_CODE_PREFIX.length + REFERRAL_CODE_BODY_LEN &&
    [...code.slice(REFERRAL_CODE_PREFIX.length)].every((c) =>
      REFERRAL_CODE_ALPHABET.includes(c)
    )
  );
}
