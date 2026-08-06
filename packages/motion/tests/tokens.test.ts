import { describe, it, expect } from "vitest";
import { durationTokens, easingTokens, springTokens } from "../src/index";

describe("Motion Tokens Audit", () => {
  it("defines all required duration tokens per EAIP Motion Spec v1.0", () => {
    expect(durationTokens.instant).toBe("0ms");
    expect(durationTokens.micro).toBe("100ms");
    expect(durationTokens.fast).toBe("150ms");
    expect(durationTokens.normal).toBe("250ms");
    expect(durationTokens.medium).toBe("350ms");
    expect(durationTokens.slow).toBe("450ms");
    expect(durationTokens.deliberate).toBe("600ms");
  });

  it("defines all required easing tokens per EAIP Motion Spec v1.0", () => {
    expect(easingTokens.linear).toBe("linear");
    expect(easingTokens.ease).toBe("ease");
    expect(easingTokens["ease-in"]).toBe("ease-in");
    expect(easingTokens["ease-out"]).toBe("ease-out");
    expect(easingTokens["ease-in-out"]).toBe("ease-in-out");
    expect(easingTokens.premium).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
    expect(easingTokens.snappy).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
    expect(easingTokens.bounce).toBe("cubic-bezier(0.34, 1.56, 0.64, 1)");
  });

  it("defines spring physics parameters correctly", () => {
    expect(springTokens.stiffness).toBe(300);
    expect(springTokens.damping).toBe(30);
    expect(springTokens.mass).toBe(1);
  });
});
