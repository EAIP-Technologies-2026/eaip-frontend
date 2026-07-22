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
}

export class ApiKnowledgeClient implements KnowledgeClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async search(query: string, tags?: string[]): Promise<KnowledgeSearchResult[]> {
    const params = new URLSearchParams({ query });
    if (tags)
      tags.forEach((t) => {
        params.append("tags", t);
      });
    const res = await fetch(`${this.baseUrl}/knowledge/search?${params.toString()}`);
    return res.json() as Promise<KnowledgeSearchResult[]>;
  }

  async getDocument(id: string): Promise<KnowledgeDocument | null> {
    try {
      const res = await fetch(`${this.baseUrl}/knowledge/documents/${id}`);
      return res.ok ? ((await res.json()) as KnowledgeDocument) : null;
    } catch {
      return null;
    }
  }

  async indexDocument(
    doc: Omit<KnowledgeDocument, "id" | "createdAt">,
  ): Promise<KnowledgeDocument> {
    const res = await fetch(`${this.baseUrl}/knowledge/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });
    return res.json() as Promise<KnowledgeDocument>;
  }
}
