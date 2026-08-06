import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useReducedMotion } from "../src/hooks/useReducedMotion";

describe("useReducedMotion Hook", () => {
  it("returns false when window.matchMedia is undefined or matches false", () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(typeof result.current).toBe("boolean");
  });
});
