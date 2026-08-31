export type DataSource = "live" | "fallback";

export interface ServiceResult<T> {
  data: T;
  source: DataSource;
  error?: string;
}

export function liveResult<T>(data: T): ServiceResult<T> {
  return { data, source: "live" };
}

export function fallbackResult<T>(data: T, error?: string): ServiceResult<T> {
  return { data, source: "fallback", error };
}

export function isMockDataEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    (process.env.NEXT_PUBLIC_EAIP_MOCK_DATA === "true" ||
      process.env.NEXT_PUBLIC_EAIP_API_MODE === "mock")
  );
}

export function isNetworkError(error: unknown): boolean {
  if (process.env.NODE_ENV === "production") return false;
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; code?: string };
  return (
    e.status === 0 ||
    e.status === 401 ||
    e.status === 404 ||
    (typeof e.status === "number" && e.status >= 500 && e.status <= 599) ||
    e.code === "NETWORK_ERROR" ||
    e.code === "TIMEOUT"
  );
}
