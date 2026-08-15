import { getDefaultClient, type ApiClient } from "@eaip/api";

export interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
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
  type?: string;
  metadata?: Record<string, unknown>;
  version?: number;
  size?: number;
  status?: string;
  collection?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface KnowledgeSearchResult {
  document: KnowledgeDocument;
  score: number;
}

export interface KnowledgeSearchResponse {
  results: KnowledgeSearchResult[];
  total: number;
  page: number;
  pageSize: number;
}

export interface KnowledgeClient {
  listCollections(): Promise<KnowledgeCollection[]>;
  createCollection(name: string, description?: string): Promise<KnowledgeCollection>;
  getCollection(name: string): Promise<KnowledgeCollection | null>;
  listDocuments(collection?: string): Promise<KnowledgeDocument[]>;
  search(
    query: string,
    options?: {
      tags?: string[];
      collection?: string;
      type?: string;
      page?: number;
      pageSize?: number;
    },
  ): Promise<KnowledgeSearchResponse>;
  getDocument(id: string): Promise<KnowledgeDocument | null>;
  createDocument(doc: {
    title: string;
    content: string;
    collection?: string;
    tags?: string[];
  }): Promise<KnowledgeDocument>;
  indexDocument(doc: Omit<KnowledgeDocument, "id" | "createdAt">): Promise<KnowledgeDocument>;
  updateDocument(id: string, doc: Partial<KnowledgeDocument>): Promise<KnowledgeDocument>;
  deleteDocument(id: string): Promise<void>;
  uploadDocument(file: File, collection?: string): Promise<KnowledgeDocument>;
  reindexDocument(id: string): Promise<void>;
}

export class ApiKnowledgeClient implements KnowledgeClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listCollections(): Promise<KnowledgeCollection[]> {
    const response = await this.client.get<KnowledgeCollection[]>("/knowledge/collections");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async createCollection(name: string, description?: string): Promise<KnowledgeCollection> {
    const response = await this.client.post<KnowledgeCollection>("/knowledge/collections", {
      name,
      description,
    });
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Create collection returned empty response");
    }
    return response.data;
  }

  async getCollection(name: string): Promise<KnowledgeCollection | null> {
    const response = await this.client.get<KnowledgeCollection>(`/knowledge/collections/${name}`);
    if (response.error) {
      if (response.error.status === 404) return null;
      throw response.error;
    }
    return response.data;
  }

  async listDocuments(collection?: string): Promise<KnowledgeDocument[]> {
    const response = await this.client.get<KnowledgeDocument[]>("/knowledge/documents", {
      collection,
    });
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async search(
    query: string,
    options?: {
      tags?: string[];
      collection?: string;
      type?: string;
      page?: number;
      pageSize?: number;
    },
  ): Promise<KnowledgeSearchResponse> {
    const response = await this.client.get<KnowledgeSearchResponse>("/knowledge/search", {
      q: query,
      tags: options?.tags,
      collection_name: options?.collection,
      type_filter: options?.type,
      page: options?.page ? String(options.page) : undefined,
      pageSize: options?.pageSize ? String(options.pageSize) : undefined,
    });
    if (response.error) throw response.error;
    return (
      response.data ?? {
        results: [],
        total: 0,
        page: options?.page ?? 1,
        pageSize: options?.pageSize ?? 20,
      }
    );
  }

  async getDocument(id: string): Promise<KnowledgeDocument | null> {
    const response = await this.client.get<KnowledgeDocument>(`/knowledge/documents/${id}`);
    if (response.error) {
      if (response.error.status === 404) return null;
      throw response.error;
    }
    return response.data;
  }

  async createDocument(doc: {
    title: string;
    content: string;
    collection?: string;
    tags?: string[];
  }): Promise<KnowledgeDocument> {
    const response = await this.client.post<KnowledgeDocument>("/knowledge/documents", doc);
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Create document returned empty response");
    }
    return response.data;
  }

  async indexDocument(
    doc: Omit<KnowledgeDocument, "id" | "createdAt">,
  ): Promise<KnowledgeDocument> {
    return this.createDocument({
      title: doc.title,
      content: doc.content,
      collection: doc.collection,
      tags: doc.tags,
    });
  }

  async updateDocument(id: string, doc: Partial<KnowledgeDocument>): Promise<KnowledgeDocument> {
    const response = await this.client.put<KnowledgeDocument>(`/knowledge/documents/${id}`, doc);
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Update document returned empty response");
    }
    return response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await this.client.delete<Record<string, unknown>>(
      `/knowledge/documents/${id}`,
    );
    if (response.error) throw response.error;
  }

  async uploadDocument(file: File, collection?: string): Promise<KnowledgeDocument> {
    const formData = new FormData();
    formData.append("file", file);
    // Backend expects `collection` as a query parameter (OpenAPI: "in": "query"),
    // not as a multipart form field. Build the URL accordingly.
    const uploadPath = collection
      ? `/knowledge/documents/upload?collection=${encodeURIComponent(collection)}`
      : "/knowledge/documents/upload";
    const response = await this.client.post<KnowledgeDocument>(uploadPath, formData);
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Upload document returned empty response");
    }
    return response.data;
  }

  async reindexDocument(id: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(
      `/knowledge/documents/${id}/reindex`,
      {},
    );
    if (response.error) throw response.error;
  }
}

export function createKnowledgeClient(client?: ApiClient): KnowledgeClient {
  return new ApiKnowledgeClient(client);
}
