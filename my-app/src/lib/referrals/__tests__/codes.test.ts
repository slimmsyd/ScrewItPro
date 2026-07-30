import { describe, expect, it } from "vitest";
import {
  generateReferralCode,
  isValidReferralCodeFormat,
  normalizeReferralCode,
} from "../codes";
import { REFERRAL_CODE_PREFIX } from "../config";
import { referralDisplayName } from "../display";

describe("referral codes", () => {
  it("generates opaque SIP-prefixed codes of fixed length", () => {
    const code = generateReferralCode(() => new Uint8Array(16).fill(3));
    expect(code.startsWith(REFERRAL_CODE_PREFIX)).toBe(true);
    expect(isValidReferralCodeFormat(code)).toBe(true);
  });

  it("normalizes and rejects junk", () => {
    expect(normalizeReferralCode("  sip7k2m9a ")).toBe("SIP7K2M9A");
    expect(normalizeReferralCode("ab")).toBeNull();
    expect(normalizeReferralCode("bad code!")).toBeNull();
    expect(normalizeReferralCode(null)).toBeNull();
  });
});

describe("referralDisplayName", () => {
  it("prefers first name", () => {
    expect(referralDisplayName({ fullName: "Jamie Lee", email: "j@x.com" })).toBe(
      "Jamie"
    );
  });

  it("masks email when no name", () => {
    expect(referralDisplayName({ fullName: null, email: "priya@example.com" })).toBe(
      "p***@example.com"
    );
  });

  it("falls back to Friend", () => {
    expect(referralDisplayName({})).toBe("Friend");
  });
});
