import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface WorkforceOverview {
  total_workers: number;
  human_workers: number;
  ai_agents: number;
  hybrid_workers: number;
  active_workers: number;
  idle_workers: number;
  overloaded_workers: number;
  unavailable_workers: number;
  utilization: number;
  workload: number;
  throughput: number;
  completion_rate: number;
  failure_rate: number;
  queue_depth: number;
}

export interface UtilizationPoint {
  date: string;
  utilization: number;
  active: number;
  idle: number;
}

export interface WorkloadEntry {
  worker_id: string;
  name: string;
  load: number;
  utilization_pct: number;
  active_count: number;
  max_concurrent: number;
}

export interface Bottleneck {
  worker_id: string;
  type: string;
  severity: string;
  description: string;
  affected_workers: number;
  suggested_action: string;
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  worker_id: string;
}

export interface Capacity {
  total_capacity: number;
  used_capacity: number;
  available_capacity: number;
  demand: number;
  shortage: number;
  utilization_pct: number;
}

const EMPTY_OVERVIEW: WorkforceOverview = {
  total_workers: 0,
  human_workers: 0,
  ai_agents: 0,
  hybrid_workers: 0,
  active_workers: 0,
  idle_workers: 0,
  overloaded_workers: 0,
  unavailable_workers: 0,
  utilization: 0,
  workload: 0,
  throughput: 0,
  completion_rate: 0,
  failure_rate: 0,
  queue_depth: 0,
};

export async function fetchWorkforceOverview(): Promise<ServiceResult<WorkforceOverview>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<WorkforceOverview & { overview?: WorkforceOverview }>(
      "/workforce/analytics/overview",
    );
    if (res.error) throw res.error;
    const d = res.data;
    return liveResult(d?.overview ?? d ?? EMPTY_OVERVIEW);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(EMPTY_OVERVIEW, "Backend unavailable");
    throw err;
  }
}

export async function fetchUtilization(days = 7): Promise<ServiceResult<UtilizationPoint[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ series: UtilizationPoint[] } | UtilizationPoint[]>(
      "/workforce/analytics/utilization",
      { days: String(days) },
    );
    if (res.error) throw res.error;
    const raw = res.data as unknown as
      ({ series?: UtilizationPoint[] } | UtilizationPoint[]) | null;
    const arr = Array.isArray(raw) ? raw : (raw?.series ?? []);
    return liveResult(arr);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchWorkload(): Promise<ServiceResult<WorkloadEntry[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ distribution: WorkloadEntry[] } | WorkloadEntry[]>(
      "/workforce/analytics/workload",
    );
    if (res.error) throw res.error;
    const raw = res.data as unknown as
      ({ distribution?: WorkloadEntry[] } | WorkloadEntry[]) | null;
    const arr = Array.isArray(raw) ? raw : (raw?.distribution ?? []);
    return liveResult(arr);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchCapacity(): Promise<ServiceResult<Capacity>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<Capacity>("/workforce/analytics/capacity");
    if (res.error) throw res.error;
    return liveResult(
      res.data ?? {
        total_capacity: 0,
        used_capacity: 0,
        available_capacity: 0,
        demand: 0,
        shortage: 0,
        utilization_pct: 0,
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          total_capacity: 0,
          used_capacity: 0,
          available_capacity: 0,
          demand: 0,
          shortage: 0,
          utilization_pct: 0,
        },
        "Backend unavailable",
      );
    throw err;
  }
}

export async function fetchBottlenecks(): Promise<ServiceResult<Bottleneck[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ bottlenecks: Bottleneck[] } | Bottleneck[]>(
      "/workforce/analytics/bottlenecks",
    );
    if (res.error) throw res.error;
    const raw = res.data as unknown as ({ bottlenecks?: Bottleneck[] } | Bottleneck[]) | null;
    const arr = Array.isArray(raw) ? raw : (raw?.bottlenecks ?? []);
    return liveResult(arr);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchRecommendations(): Promise<ServiceResult<Recommendation[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ recommendations: Recommendation[] } | Recommendation[]>(
      "/workforce/analytics/recommendations",
    );
    if (res.error) throw res.error;
    const raw = res.data as unknown as
      ({ recommendations?: Recommendation[] } | Recommendation[]) | null;
    const arr = Array.isArray(raw) ? raw : (raw?.recommendations ?? []);
    return liveResult(arr);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchWorkforceTrends(
  days = 30,
): Promise<ServiceResult<{ utilization: unknown; throughput: unknown }>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ utilization: unknown; throughput: unknown }>(
      "/workforce/analytics/trends",
      { days: String(days) },
    );
    if (res.error) throw res.error;
    return liveResult(res.data ?? { utilization: {}, throughput: {} });
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult({ utilization: {}, throughput: {} }, "Backend unavailable");
    throw err;
  }
}

export async function fetchWorkerPerformance(
  workerId: string,
): Promise<ServiceResult<Record<string, unknown>>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<Record<string, unknown>>(
      `/workforce/analytics/workers/${encodeURIComponent(workerId)}/performance`,
    );
    if (res.error) throw res.error;
    return liveResult(res.data ?? {});
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
