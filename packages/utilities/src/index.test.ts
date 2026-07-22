import { describe, it } from "vitest";
import { expect } from "@storybook/test";
import { cn, clamp, noop, generateId } from "./index";

describe("utilities", () => {
  it("cn joins class names", async () => {
    await expect(cn("a", "b", false)).toBe("a b");
  });

  it("clamp restricts values", async () => {
    await expect(clamp(5, 0, 10)).toBe(5);
    await expect(clamp(-1, 0, 10)).toBe(0);
    await expect(clamp(15, 0, 10)).toBe(10);
  });

  it("noop does nothing", () => {
    noop();
  });

  it("generateId creates string", async () => {
    await expect(generateId()).toBeTruthy();
    await expect(generateId().length).toBe(9);
  });
});
