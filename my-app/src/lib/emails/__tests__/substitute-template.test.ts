import { describe, expect, it } from "vitest";
import {
  htmlSafeVars,
  substituteTemplate,
} from "../substitute-template";

describe("substituteTemplate", () => {
  it("replaces known vars and blanks unknown", () => {
    expect(
      substituteTemplate("Hi {{customerName}} — {{orderNumber}} {{missing}}", {
        customerName: "Pat",
        orderNumber: "SIP-1",
      })
    ).toBe("Hi Pat — SIP-1 ");
  });

  it("htmlSafeVars escapes content but not URL keys", () => {
    const safe = htmlSafeVars({
      customerName: "A <b>x</b>",
      trackUrl: "https://example.com/t",
    });
    expect(safe.customerName).toBe("A &lt;b&gt;x&lt;/b&gt;");
    expect(safe.trackUrl).toBe("https://example.com/t");
  });
});
