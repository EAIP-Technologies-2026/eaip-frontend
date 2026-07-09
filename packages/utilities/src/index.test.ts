import { describe, it, expect } from "vitest";
import { cn, clamp, noop, generateId } from "./index";

describe("utilities", () => {
  it("cn joins class names", () => {
    expect(cn("a", "b", false && "c")).toBe("a b");
  });

  it("clamp restricts values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("noop does nothing", () => {
    expect(noop()).toBeUndefined();
  });

  it("generateId creates string", () => {
    expect(generateId()).toBeTruthy();
    expect(generateId().length).toBe(9);
  });
});
