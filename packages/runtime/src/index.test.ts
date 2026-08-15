import { describe, it, expect } from "vitest";
import { ApiRuntimeClient } from "./index";

describe("runtime", () => {
  it("package loads without error", () => {
    expect(typeof ApiRuntimeClient).toBe("function");
  });

  it("ApiRuntimeClient can be instantiated with a mock client", () => {
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiRuntimeClient(mockClient);
    expect(client).toBeDefined();
  });
});
