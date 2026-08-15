import { describe, it, expect } from "vitest";
import { ApiKnowledgeClient } from "./index";
import type { KnowledgeCollection, KnowledgeDocument } from "./index";

describe("knowledge", () => {
  it("package loads without error", () => {
    expect(typeof ApiKnowledgeClient).toBe("function");
  });

  it("ApiKnowledgeClient can be instantiated with a mock client", () => {
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiKnowledgeClient(mockClient);
    expect(client).toBeDefined();
  });

  it("KnowledgeCollection type has required fields", () => {
    const collection: KnowledgeCollection = {
      id: "col-1",
      name: "default",
      description: "Default collection",
      documentCount: 10,
      totalSize: 1024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(collection.id).toBe("col-1");
    expect(collection.name).toBe("default");
    expect(collection.documentCount).toBe(10);
  });

  it("KnowledgeDocument type has required fields", () => {
    const doc: KnowledgeDocument = {
      id: "doc-1",
      title: "Test Document",
      content: "Hello world",
      tags: ["test"],
      createdAt: new Date().toISOString(),
    };
    expect(doc.id).toBe("doc-1");
    expect(doc.title).toBe("Test Document");
    expect(doc.tags).toContain("test");
  });

  it("listCollections calls correct endpoint", async () => {
    let capturedPath = "";
    const mockClient = {
      get: (path: string) => {
        capturedPath = path;
        return Promise.resolve({ data: [], error: null, status: 200, headers: new Headers() });
      },
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiKnowledgeClient(mockClient);
    await client.listCollections();
    expect(capturedPath).toBe("/knowledge/collections");
  });

  it("search calls correct endpoint with parameters", async () => {
    let capturedPath = "";
    let capturedParams: Record<string, string> = {};
    const mockClient = {
      get: (path: string, params?: Record<string, string>) => {
        capturedPath = path;
        capturedParams = params ?? {};
        return Promise.resolve({
          data: { results: [], total: 0, page: 1, pageSize: 20 },
          error: null,
          status: 200,
          headers: new Headers(),
        });
      },
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiKnowledgeClient(mockClient);
    await client.search("test query", { collection: "default", page: 2, pageSize: 10 });
    expect(capturedPath).toBe("/knowledge/search");
    expect(capturedParams.q).toBe("test query");
    expect(capturedParams.collection_name).toBe("default");
    expect(capturedParams.page).toBe("2");
    expect(capturedParams.pageSize).toBe("10");
  });

  it("deleteDocument calls correct endpoint", async () => {
    let capturedPath = "";
    const mockClient = {
      get: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: (path: string) => {
        capturedPath = path;
        return Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() });
      },
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiKnowledgeClient(mockClient);
    await client.deleteDocument("doc-123");
    expect(capturedPath).toBe("/knowledge/documents/doc-123");
  });

  it("getDocument returns null on 404", async () => {
    const mockClient = {
      get: () => Promise.resolve({
        data: null,
        error: { status: 404, message: "Not found" },
        status: 404,
        headers: new Headers(),
      }),
      post: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      put: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      delete: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
      patch: () => Promise.resolve({ data: null, error: null, status: 200, headers: new Headers() }),
    };
    // @ts-expect-error — partial mock for unit testing
    const client = new ApiKnowledgeClient(mockClient);
    const result = await client.getDocument("nonexistent");
    expect(result).toBeNull();
  });
});
