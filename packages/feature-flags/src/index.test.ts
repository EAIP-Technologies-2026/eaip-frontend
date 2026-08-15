import { describe, it, expect } from "vitest";
import { registerFlag, isEnabled, setEnabled, ApiFeatureFlagClient } from "./index";

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

  it("ApiFeatureFlagClient can be instantiated with a mock client", () => {
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiFeatureFlagClient(mockClient);
    expect(client).toBeDefined();
  });
});
