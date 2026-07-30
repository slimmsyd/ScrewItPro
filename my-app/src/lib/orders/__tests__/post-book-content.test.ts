import { describe, expect, it } from "vitest";
import {
  hubIntakeEmailText,
  nextStepForStatus,
} from "../post-book-content";

describe("post-book-content", () => {
  it("booked next step is hub-focused (not deposit-only)", () => {
    const step = nextStepForStatus("booked");
    expect(step.title.toLowerCase()).toMatch(/hub/);
    expect(step.body.toLowerCase()).toMatch(/order number|sip/i);
    expect(step.cta.toLowerCase()).not.toMatch(/window|shipping details/);
  });

  it("later statuses do not CTA choose delivery window", () => {
    expect(nextStepForStatus("in_workshop").cta).toBe("Track order");
    expect(nextStepForStatus("assembled_inspected").body).not.toMatch(
      /choose when/i
    );
  });

  it("email text includes order label instruction", () => {
    const text = hubIntakeEmailText("SIP-10012");
    expect(text).toContain("SIP-10012");
    expect(text).toMatch(/Mark every box/i);
  });
});
