export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      ...this.config.headers,
    };
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        method: "GET",
        headers: this.getHeaders(),
      });
      const data = res.ok ? ((await res.json()) as T) : null;
      return { data, error: res.ok ? null : `HTTP ${res.status}`, status: res.status };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Unknown error", status: 0 };
    }
  }

  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${this.config.baseUrl}${path}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      const data = res.ok ? ((await res.json()) as T) : null;
      return { data, error: res.ok ? null : `HTTP ${res.status}`, status: res.status };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : "Unknown error", status: 0 };
    }
  }
}

let defaultClient: ApiClient | null = null;

export function setDefaultClient(client: ApiClient): void {
  defaultClient = client;
}

export function getDefaultClient(): ApiClient {
  if (!defaultClient) throw new Error("API client not configured");
  return defaultClient;
}
