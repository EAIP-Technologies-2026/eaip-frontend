export type ApiMode = "mock" | "development" | "production";

export interface ApiConfig {
  mode: ApiMode;
  baseUrl: string;
  timeoutMs: number;
  retries: number;
  retryDelayMs: number;
}

function detectMode(): ApiMode {
  if (typeof window === "undefined") return "mock";
  const env = process.env.NEXT_PUBLIC_EAIP_API_MODE;
  if (env === "production") return "production";
  if (env === "development") return "development";
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "development";
  return "production";
}

function getDefaultBaseUrl(mode: ApiMode): string {
  if (mode === "mock") return "http://localhost:8080/api";
  const envUrl = process.env.NEXT_PUBLIC_EAIP_API_URL;
  if (envUrl) return envUrl;
  if (mode === "production") return "/api";
  return "http://localhost:8080/api";
}

let cachedConfig: ApiConfig | null = null;

export function getApiConfig(): ApiConfig {
  if (cachedConfig) return cachedConfig;
  const mode = detectMode();
  cachedConfig = {
    mode,
    baseUrl: getDefaultBaseUrl(mode),
    timeoutMs: 10_000,
    retries: mode === "production" ? 3 : 2,
    retryDelayMs: 500,
  };
  return cachedConfig;
}

export function isMockMode(): boolean {
  return getApiConfig().mode === "mock";
}
