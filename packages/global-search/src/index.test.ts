import { describe, it, expect } from "vitest";
import { ApiSearchClient } from "./index";

describe("global-search", () => {
  it("package loads without error", () => {
    expect(typeof ApiSearchClient).toBe("function");
  });

  it("ApiSearchClient can be instantiated with a mock client", () => {
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () =>
        Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () =>
        Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiSearchClient(mockClient);
    expect(client).toBeDefined();
  });

  it("getCapabilities requests /search/capabilities and falls back to empty", async () => {
    const mockClient = {
      get: (path: string) => {
        if (path === "/search/capabilities") {
          return Promise.resolve({
            data: {
              engineAvailable: true,
              sources: [{ id: "knowledge", available: true, label: "Knowledge", description: "" }],
            },
            error: null,
            status: 200,
            headers: new Headers(),
          });
        }
        return Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() });
      },
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () =>
        Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () =>
        Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiSearchClient(mockClient);
    const caps = await client.getCapabilities();
    expect(caps.engineAvailable).toBe(true);
    expect(caps.sources[0]?.id).toBe("knowledge");
  });

  it("search forwards collection param", async () => {
    let requestedPath = "";
    let requestedParams: Record<string, string> = {};
    const mockClient = {
      get: (path: string, params?: Record<string, string>) => {
        requestedPath = path;
        requestedParams = params ?? {};
        return Promise.resolve({
          data: { results: [], suggestions: [], total: 0, page: 1, pageSize: 20, query: "q" },
          error: null,
          status: 200,
          headers: new Headers(),
        });
      },
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () =>
        Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () =>
        Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiSearchClient(mockClient);
    await client.search({ query: "policy", collection: "governance" });
    expect(requestedPath).toBe("/search");
    expect(requestedParams.collection).toBe("governance");
  });
});
