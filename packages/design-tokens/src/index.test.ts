import { describe, it, expect } from "vitest";
import { tokens } from "./index";

describe("design-tokens", () => {
  it("exports color tokens", () => {
    expect(tokens.color).toBeDefined();
    expect(tokens.color.neutral[50]).toBe("#fafafa");
    expect(tokens.color.primary[500]).toBe("#3b82f6");
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
});
