import { describe, it, expect } from "vitest";
import { registerFlag, isEnabled, setEnabled } from "./index";

describe("feature-flags", () => {
  it("registers and checks a flag", () => {
    registerFlag({ key: "test-feature", enabled: true });
    expect(isEnabled("test-feature")).toBe(true);
  });

  it("returns false for unregistered flags", () => {
    expect(isEnabled("nonexistent")).toBe(false);
  });

  it("toggles a flag via setEnabled", () => {
    registerFlag({ key: "toggle-feature", enabled: false });
    expect(isEnabled("toggle-feature")).toBe(false);
    setEnabled("toggle-feature", true);
    expect(isEnabled("toggle-feature")).toBe(true);
  });
});
