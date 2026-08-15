import { describe, it, expect } from "vitest";
import { ApiOrganizationsClient } from "./index";

describe("organizations", () => {
  it("package loads without error", () => {
    expect(typeof ApiOrganizationsClient).toBe("function");
  });

  it("ApiOrganizationsClient can be instantiated with a mock client", () => {
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiOrganizationsClient(mockClient);
    expect(client).toBeDefined();
  });
});
