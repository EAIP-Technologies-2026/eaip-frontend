import { getDefaultClient, type ApiClient } from "@eaip/api";

export interface MemoryEntry {
  id: string;
  key: string;
  value: unknown;
  timestamp: string;
}

export interface MemoryClient {
  get(key: string): Promise<MemoryEntry | null>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<MemoryEntry[]>;
  search(query: string, prefix?: string): Promise<MemoryEntry[]>;
}

export class ApiMemoryClient implements MemoryClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async get(key: string): Promise<MemoryEntry | null> {
    const response = await this.client.get<MemoryEntry>(`/memory/${encodeURIComponent(key)}`);
    if (response.error) {
      if (response.error.status === 404) return null;
      throw response.error;
    }
    return response.data;
  }

  async set(key: string, value: unknown): Promise<void> {
    const response = await this.client.put<Record<string, unknown>>(
      `/memory/${encodeURIComponent(key)}`,
      { value },
    );
    if (response.error) throw response.error;
  }

  async delete(key: string): Promise<void> {
    const response = await this.client.delete<Record<string, unknown>>(
      `/memory/${encodeURIComponent(key)}`,
    );
    if (response.error) throw response.error;
  }

  async list(prefix?: string): Promise<MemoryEntry[]> {
    const response = await this.client.get<MemoryEntry[]>(
      "/memory",
      prefix ? { prefix } : undefined,
    );
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async search(query: string, prefix?: string): Promise<MemoryEntry[]> {
    const response = await this.client.get<MemoryEntry[]>("/memory/search", {
      q: query,
      prefix,
    });
    if (response.error) throw response.error;
    return response.data ?? [];
  }
}

export function createMemoryClient(client?: ApiClient): MemoryClient {
  return new ApiMemoryClient(client);
}
