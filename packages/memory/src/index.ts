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
}

export class ApiMemoryClient implements MemoryClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get(key: string): Promise<MemoryEntry | null> {
    try {
      const res = await fetch(`${this.baseUrl}/memory/${encodeURIComponent(key)}`);
      return res.ok ? ((await res.json()) as MemoryEntry) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    await fetch(`${this.baseUrl}/memory/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
  }

  async delete(key: string): Promise<void> {
    await fetch(`${this.baseUrl}/memory/${encodeURIComponent(key)}`, { method: "DELETE" });
  }

  async list(prefix?: string): Promise<MemoryEntry[]> {
    const qs = prefix ? `?prefix=${encodeURIComponent(prefix)}` : "";
    const res = await fetch(`${this.baseUrl}/memory${qs}`);
    return res.json() as Promise<MemoryEntry[]>;
  }
}
