import { describe, it } from "vitest";
import { expect } from "@storybook/test";
import { getConfig, isDevelopment, isProduction } from "./index";

describe("config", () => {
  it("returns default config", async () => {
    const config = getConfig();
    await expect(config.appUrl).toBeDefined();
    await expect(config.apiUrl).toBeDefined();
  });

  it("detects development", async () => {
    await expect(typeof isDevelopment()).toBe("boolean");
  });

  it("detects production", async () => {
    await expect(typeof isProduction()).toBe("boolean");
  });
});
