import { describe, it } from "vitest";
import { expect } from "@storybook/test";
import { renderHook } from "@testing-library/react";
import { useDebounce, useLocalStorage } from "./index";

describe("useDebounce", () => {
  it("returns initial value immediately", async () => {
    const { result } = renderHook(() => useDebounce("hello", 500));
    await expect(result.current).toBe("hello");
  });
});

describe("useLocalStorage", () => {
  it("returns initial value", async () => {
    const { result } = renderHook(() => useLocalStorage("test", "default"));
    await expect(result.current[0]).toBe("default");
  });
});
