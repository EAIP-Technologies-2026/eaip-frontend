import { getDefaultClient, type ApiClient } from "@eaip/api";

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface KnowledgeSearchResult {
  document: KnowledgeDocument;
  score: number;
}

export interface KnowledgeClient {
  search(query: string, tags?: string[]): Promise<KnowledgeSearchResult[]>;
  getDocument(id: string): Promise<KnowledgeDocument | null>;
  indexDocument(doc: Omit<KnowledgeDocument, "id" | "createdAt">): Promise<KnowledgeDocument>;
  deleteDocument(id: string): Promise<void>;
}

export class ApiKnowledgeClient implements KnowledgeClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async search(query: string, tags?: string[]): Promise<KnowledgeSearchResult[]> {
    const response = await this.client.get<KnowledgeSearchResult[]>("/knowledge/search", {
      query,
      tags,
    });
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getDocument(id: string): Promise<KnowledgeDocument | null> {
    const response = await this.client.get<KnowledgeDocument>(`/knowledge/documents/${id}`);
    if (response.error) {
      if (response.error.status === 404) return null;
      throw response.error;
    }
    return response.data;
  }

  async indexDocument(
    doc: Omit<KnowledgeDocument, "id" | "createdAt">,
  ): Promise<KnowledgeDocument> {
    const response = await this.client.post<KnowledgeDocument>("/knowledge/documents", doc);
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Index document returned empty response");
    }
    return response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    const response = await this.client.delete<Record<string, unknown>>(
      `/knowledge/documents/${id}`,
    );
    if (response.error) throw response.error;
  }
}

export function createKnowledgeClient(client?: ApiClient): KnowledgeClient {
  return new ApiKnowledgeClient(client);
}
