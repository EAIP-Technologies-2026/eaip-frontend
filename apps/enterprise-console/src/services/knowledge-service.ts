import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockKnowledgeArticles } from "../mock-data/data";

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  tags: string[];
  author: string;
  updatedAt: string;
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalCollections: number;
  totalStorage: number;
  indexedCount: number;
  pendingCount: number;
  failedCount: number;
}

export interface KnowledgeHealth {
  status: "healthy" | "degraded" | "empty";
  totalDocuments: number;
  totalCollections: number;
  totalChunks: number;
  indexedCount: number;
  pendingCount: number;
  failedCount: number;
  engineAvailable: boolean;
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  description: string;
  documentCount: number;
  chunkCount: number;
  indexedCount: number;
  pendingCount: number;
  failedCount: number;
  status: "healthy" | "degraded" | "empty";
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeCollection {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  totalSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  type: string;
  metadata: Record<string, unknown>;
  version: number;
  size: number;
  status: string;
}

export interface KnowledgeSearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: string;
  score: number;
  tags: string[];
  collectionId: string;
}

export interface KnowledgeSearchResponse {
  results: KnowledgeSearchResult[];
  total: number;
  page: number;
  pageSize: number;
}

export interface KnowledgeCitation {
  id: string;
  documentId: string;
  collection: string;
  content: string;
  score: number;
  chunkIndex: number;
  source: string;
}

function parseArticle(data: unknown): KnowledgeArticle | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (typeof obj.id !== "string" || typeof obj.title !== "string") return null;
  return {
    id: obj.id,
    title: obj.title,
    category: typeof obj.category === "string" ? obj.category : "Uncategorized",
    summary: typeof obj.summary === "string" ? obj.summary : "",
    tags: Array.isArray(obj.tags) ? obj.tags.filter((t): t is string => typeof t === "string") : [],
    author: typeof obj.author === "string" ? obj.author : "Unknown",
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : new Date().toISOString(),
  };
}

export async function fetchKnowledgeArticles(): Promise<ServiceResult<KnowledgeArticle[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<unknown>("/knowledge/documents");
    if (response.error) throw response.error;
    const raw = Array.isArray(response.data) ? (response.data as unknown[]) : [];
    const articles = raw.map(parseArticle).filter((a): a is KnowledgeArticle => a !== null);
    return liveResult(articles);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        createMockKnowledgeArticles(),
        err instanceof Error ? err.message : "Backend unavailable",
      );
    }
    throw err;
  }
}

export async function fetchKnowledgeStats(): Promise<ServiceResult<KnowledgeStats>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<KnowledgeStats>("/knowledge/stats");
    if (response.error) throw response.error;
    return liveResult(
      response.data ?? {
        totalDocuments: 0,
        totalCollections: 0,
        totalStorage: 0,
        indexedCount: 0,
        pendingCount: 0,
        failedCount: 0,
      },
    );
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        {
          totalDocuments: 0,
          totalCollections: 0,
          totalStorage: 0,
          indexedCount: 0,
          pendingCount: 0,
          failedCount: 0,
        },
        "Backend unavailable",
      );
    }
    throw err;
  }
}

export async function fetchKnowledgeHealth(): Promise<ServiceResult<KnowledgeHealth>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<KnowledgeHealth>("/knowledge/health");
    if (response.error) throw response.error;
    return liveResult(
      response.data ?? {
        status: "empty",
        totalDocuments: 0,
        totalCollections: 0,
        totalChunks: 0,
        indexedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        engineAvailable: false,
      },
    );
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        {
          status: "empty",
          totalDocuments: 0,
          totalCollections: 0,
          totalChunks: 0,
          indexedCount: 0,
          pendingCount: 0,
          failedCount: 0,
          engineAvailable: false,
        },
        "Backend unavailable",
      );
    }
    throw err;
  }
}

export async function fetchKnowledgeSources(): Promise<ServiceResult<KnowledgeSource[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<KnowledgeSource[]>("/knowledge/sources");
    if (response.error) throw response.error;
    return liveResult(response.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchKnowledgeCollections(): Promise<ServiceResult<KnowledgeCollection[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<KnowledgeCollection[]>("/knowledge/collections");
    if (response.error) throw response.error;
    return liveResult(response.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchKnowledgeDocuments(
  collection?: string,
): Promise<ServiceResult<KnowledgeDocument[]>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = {};
    if (collection) params.collection = collection;
    const response = await client.get<KnowledgeDocument[]>("/knowledge/documents", params);
    if (response.error) throw response.error;
    return liveResult(response.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function searchKnowledge(
  query: string,
  options?: {
    collection?: string;
    tags?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  },
): Promise<ServiceResult<KnowledgeSearchResponse>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = { q: query };
    if (options?.collection) params.collection_name = options.collection;
    if (options?.tags) params.tags = options.tags;
    if (options?.type) params.type_filter = options.type;
    if (options?.page) params.page = String(options.page);
    if (options?.pageSize) params.pageSize = String(options.pageSize);
    const response = await client.get<KnowledgeSearchResponse>("/knowledge/search", params);
    if (response.error) throw response.error;
    return liveResult(response.data ?? { results: [], total: 0, page: 1, pageSize: 20 });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        { results: [], total: 0, page: 1, pageSize: 20 },
        "Backend unavailable",
      );
    }
    throw err;
  }
}

export async function fetchCitations(
  query: string,
  documentId?: string,
): Promise<ServiceResult<KnowledgeCitation[]>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = { q: query };
    if (documentId) params.document_id = documentId;
    const response = await client.get<{ citations: KnowledgeCitation[] }>(
      "/knowledge/citations",
      params,
    );
    if (response.error) throw response.error;
    return liveResult(response.data?.citations ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}
