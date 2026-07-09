import { describe, it, expect } from "vitest";
import { getConfig, isDevelopment, isProduction } from "./index";

describe("config", () => {
  it("returns default config", () => {
    const config = getConfig();
    expect(config.appUrl).toBeDefined();
    expect(config.apiUrl).toBeDefined();
  });

  it("detects development", () => {
    expect(typeof isDevelopment()).toBe("boolean");
  });

  it("detects production", () => {
    expect(typeof isProduction()).toBe("boolean");
  });
});
