export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  tokenProvider?: () => string | null | Promise<string | null>;
  onRequest?: (request: RequestInit) => RequestInit | Promise<RequestInit>;
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
}

export interface ApiErrorDetails {
  status: number;
  code: string;
  message: string;
  data?: unknown;
}

export class ApiError extends Error implements ApiErrorDetails {
  status: number;
  code: string;
  data?: unknown;

  constructor({ status, code, message, data }: ApiErrorDetails) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
  headers: Headers;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 500;

function isRetryableError(error: ApiError): boolean {
  if (error.status >= 500 && error.status < 600) return true;
  if (error.code === "NETWORK_ERROR") return true;
  if (error.code === "TIMEOUT") return true;
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildQueryString(params?: Record<string, string | string[] | undefined>): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, item);
      }
    } else {
      searchParams.set(key, value);
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  private async getHeaders(
    overrides?: Record<string, string>,
    body?: unknown,
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...this.config.headers,
      ...overrides,
    };

    if (!(body instanceof FormData) && !(body instanceof URLSearchParams)) {
      headers["Content-Type"] = "application/json";
    }

    const token = await this.config.tokenProvider?.();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async executeRequest<T>(
    url: string,
    method: HttpMethod,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const timeoutMs = options?.timeoutMs ?? this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const retries = options?.retries ?? this.config.retries ?? DEFAULT_RETRIES;
    const retryDelayMs = this.config.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

    let lastResponse: ApiResponse<T> = {
      data: null,
      error: null,
      status: 0,
      headers: new Headers(),
    };

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      try {
        const headers = await this.getHeaders(options?.headers, body);
        let requestInit: RequestInit = {
          method,
          headers,
          credentials: this.config.credentials ?? "include",
          signal: controller.signal,
        };

        if (body !== undefined && method !== "GET") {
          requestInit.body =
            body instanceof FormData || body instanceof URLSearchParams ? body : JSON.stringify(body);
        }

        if (this.config.onRequest) {
          requestInit = await this.config.onRequest(requestInit);
        }

        const res = await fetch(url, requestInit);
        clearTimeout(timeoutId);

        const responseHeaders = res.headers;
        let data: T | null = null;
        const contentType = responseHeaders.get("content-type") ?? "";

        if (res.status !== 204 && contentType.includes("application/json")) {
          try {
            data = (await res.json()) as T;
          } catch {
            data = null;
          }
        }

        if (res.ok) {
          const response: ApiResponse<T> = {
            data,
            error: null,
            status: res.status,
            headers: responseHeaders,
          };
          lastResponse = this.config.onResponse ? await this.config.onResponse(response) : response;
          return lastResponse;
        }

        const errorPayload = (data ?? {}) as Record<string, unknown>;
        const error: ApiError = new ApiError({
          status: res.status,
          code:
            typeof errorPayload.code === "string"
              ? errorPayload.code
              : `HTTP_${String(res.status)}`,
          message:
            typeof errorPayload.message === "string"
              ? errorPayload.message
              : typeof errorPayload.detail === "string"
                ? errorPayload.detail
                : `Request failed with status ${String(res.status)}`,
          data: errorPayload,
        });

        lastResponse = {
          data: null,
          error,
          status: res.status,
          headers: responseHeaders,
        };

        if (!isRetryableError(error) || attempt === retries) {
          return this.config.onResponse ? await this.config.onResponse(lastResponse) : lastResponse;
        }
      } catch (err) {
        clearTimeout(timeoutId);
        const isTimeout = err instanceof Error && err.name === "AbortError";
        const error = new ApiError({
          status: 0,
          code: isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
          message: isTimeout
            ? `Request timed out after ${String(timeoutMs)}ms`
            : err instanceof Error
              ? err.message
              : "Network error",
        });
        lastResponse = {
          data: null,
          error,
          status: 0,
          headers: new Headers(),
        };

        if (!isRetryableError(error) || attempt === retries) {
          return this.config.onResponse ? await this.config.onResponse(lastResponse) : lastResponse;
        }
      }

      const delay = retryDelayMs * 2 ** attempt;
      await sleep(delay);
    }

    return lastResponse;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | string[] | undefined>,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const query = buildQueryString(params);
    return this.executeRequest<T>(
      `${this.config.baseUrl}${path}${query}`,
      "GET",
      undefined,
      options,
    );
  }

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(`${this.config.baseUrl}${path}`, "POST", body, options);
  }

  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(`${this.config.baseUrl}${path}`, "PUT", body, options);
  }

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(`${this.config.baseUrl}${path}`, "PATCH", body, options);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(`${this.config.baseUrl}${path}`, "DELETE", undefined, options);
  }
}

let defaultClient: ApiClient | null = null;

export function setDefaultClient(client: ApiClient): void {
  defaultClient = client;
}

export function getDefaultClient(): ApiClient {
  if (!defaultClient) {
    throw new Error("API client not configured. Call setDefaultClient() first.");
  }
  return defaultClient;
}

export function createDefaultClient(config: {
  baseUrl: string;
  tokenProvider?: () => string | null | Promise<string | null>;
}): ApiClient {
  return new ApiClient({
    baseUrl: config.baseUrl,
    credentials: "include",
    timeoutMs: DEFAULT_TIMEOUT_MS,
    retries: DEFAULT_RETRIES,
    retryDelayMs: DEFAULT_RETRY_DELAY_MS,
    tokenProvider: config.tokenProvider,
    onResponse: (response) => {
      if (response.error?.status === 401) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("eaip:session-expired"));
        }
      }
      return response;
    },
  });
}
