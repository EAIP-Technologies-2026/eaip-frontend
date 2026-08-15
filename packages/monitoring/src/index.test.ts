import { describe, it, expect } from "vitest";
import { ApiMonitoringClient } from "./index";

describe("monitoring", () => {
  it("package loads without error", () => {
    expect(typeof ApiMonitoringClient).toBe("function");
  });

  it("ApiMonitoringClient can be instantiated with a mock client", () => {
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiMonitoringClient(mockClient);
    expect(client).toBeDefined();
  });
});
