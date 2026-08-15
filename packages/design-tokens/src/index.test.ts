import { describe, it, expect } from "vitest";
import { tokens } from "./index";

describe("design-tokens", () => {
  it("exports color tokens", () => {
    expect(tokens.color).toBeDefined();
    expect(tokens.color.neutral[50]).toBe("#fafafa");
    expect(tokens.color.primary[500]).toBe("#4338ca");
  });

  it("exports spacing tokens", () => {
    expect(tokens.spacing[4]).toBe("1rem");
  });

  it("exports typography tokens", () => {
    expect(tokens.typography.fontFamily.sans).toContain("Inter");
  });

  it("exports shadow tokens", () => {
    expect(tokens.shadow.sm).toBeDefined();
  });

  it("exports radius tokens", () => {
    expect(tokens.radius.full).toBe("9999px");
  });

  it("exports motion tokens", () => {
    expect(tokens.motion.duration.fast).toBe("150ms");
    expect(tokens.motion.easing.premium).toBe("cubic-bezier(0.16, 1, 0.3, 1)");
    expect(tokens.motion.spring.stiffness).toBe(300);
  });
});
