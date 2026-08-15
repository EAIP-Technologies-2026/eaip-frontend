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

export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; code?: string };
  return e.status === 0 || e.code === "NETWORK_ERROR" || e.code === "TIMEOUT";
}
