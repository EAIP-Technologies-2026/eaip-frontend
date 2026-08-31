import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScheduleTrigger {
  kind: string;
  cron_expr?: string | null;
  interval_seconds?: number | null;
  run_at?: string | null;
  timezone?: string | null;
}

export interface ScheduleRetryPolicy {
  max_retries?: number;
  backoff_seconds?: number;
  backoff_strategy?: string;
}

export interface Schedule {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  target_type: string;
  target_id: string;
  trigger: ScheduleTrigger;
  execution_window?: string | null;
  priority: string;
  dependencies?: string[];
  retry_policy?: ScheduleRetryPolicy | null;
  status: string;
  created_at: string;
  next_run_at?: string | null;
  last_run_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ScheduleExecution {
  id: string;
  schedule_id: string;
  status: string;
  trigger?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  duration_ms?: number | null;
  output?: string | null;
  error?: string | null;
  triggered_by?: string | null;
  created_at?: string | null;
}

export interface ScheduleHealth {
  schedule_id: string;
  status: string;
  healthy: boolean;
  consecutive_failures?: number;
  last_execution_status?: string | null;
  last_success_at?: string | null;
  next_run_at?: string | null;
  is_overdue?: boolean;
  message?: string | null;
}

export interface ScheduleStats {
  total: number;
  active: number;
  paused: number;
  failed: number;
  overdue: number;
  completed?: number;
  pending?: number;
  scheduled?: number;
}

export interface FetchSchedulesParams {
  status?: string;
  target_type?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

const EMPTY_STATS: ScheduleStats = {
  total: 0,
  active: 0,
  paused: 0,
  failed: 0,
  overdue: 0,
  completed: 0,
  pending: 0,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toQuery(params?: FetchSchedulesParams): Record<string, string | undefined> | undefined {
  if (!params) return undefined;
  const q: Record<string, string | undefined> = {};
  if (params.status) q.status = params.status;
  if (params.target_type) q.target_type = params.target_type;
  if (params.search) q.search = params.search;
  if (params.page !== undefined) q.page = String(params.page);
  if (params.pageSize !== undefined) q.page_size = String(params.pageSize);
  return q;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function fetchSchedules(
  params?: FetchSchedulesParams,
): Promise<ServiceResult<{ schedules: Schedule[]; total: number }>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ schedules: Schedule[]; total: number } | Schedule[]>(
      "/schedules",
      toQuery(params),
    );
    if (res.error) throw res.error;
    const raw = res.data;
    if (Array.isArray(raw)) {
      return liveResult({ schedules: raw, total: raw.length });
    }
    return liveResult({
      schedules: raw?.schedules ?? [],
      total: raw?.total ?? (raw?.schedules ?? []).length,
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ schedules: [], total: 0 }, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchSchedule(id: string): Promise<ServiceResult<Schedule | null>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<Schedule>(`/schedules/${encodeURIComponent(id)}`);
    if (res.error) throw res.error;
    return liveResult(res.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchExecutions(id: string): Promise<ServiceResult<ScheduleExecution[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ executions: ScheduleExecution[] } | ScheduleExecution[]>(
      `/schedules/${encodeURIComponent(id)}/executions`,
    );
    if (res.error) throw res.error;
    const raw = res.data;
    if (Array.isArray(raw)) return liveResult(raw);
    return liveResult(raw?.executions ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchHealth(id: string): Promise<ServiceResult<ScheduleHealth | null>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<ScheduleHealth>(`/schedules/${encodeURIComponent(id)}/health`);
    if (res.error) throw res.error;
    return liveResult(res.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchUpcoming(horizon?: string): Promise<ServiceResult<Schedule[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ schedules: Schedule[] } | Schedule[]>(
      "/schedules/upcoming",
      horizon ? { horizon } : undefined,
    );
    if (res.error) throw res.error;
    const raw = res.data;
    if (Array.isArray(raw)) return liveResult(raw);
    return liveResult(raw?.schedules ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchStats(): Promise<ServiceResult<ScheduleStats>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<ScheduleStats>("/schedules/stats");
    if (res.error) throw res.error;
    return liveResult(res.data ?? EMPTY_STATS);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(EMPTY_STATS, "Backend unavailable");
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createSchedule(
  body: Partial<Schedule> & {
    name: string;
    target_type: string;
    target_id: string;
    trigger: ScheduleTrigger;
  },
): Promise<ServiceResult<Schedule | null>> {
  try {
    const client = getDefaultClient();
    const res = await client.post<Schedule>("/schedules", body);
    if (res.error) throw res.error;
    return liveResult(res.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function updateSchedule(
  id: string,
  body: Partial<Schedule>,
): Promise<ServiceResult<Schedule | null>> {
  try {
    const client = getDefaultClient();
    const res = await client.put<Schedule>(`/schedules/${encodeURIComponent(id)}`, body);
    if (res.error) throw res.error;
    return liveResult(res.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function deleteSchedule(id: string): Promise<ServiceResult<void>> {
  try {
    const client = getDefaultClient();
    const res = await client.delete<null>(`/schedules/${encodeURIComponent(id)}`);
    if (res.error) throw res.error;
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function pauseSchedule(id: string): Promise<ServiceResult<Schedule | null>> {
  try {
    const client = getDefaultClient();
    const res = await client.post<Schedule>(`/schedules/${encodeURIComponent(id)}/pause`);
    if (res.error) throw res.error;
    return liveResult(res.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function resumeSchedule(id: string): Promise<ServiceResult<Schedule | null>> {
  try {
    const client = getDefaultClient();
    const res = await client.post<Schedule>(`/schedules/${encodeURIComponent(id)}/resume`);
    if (res.error) throw res.error;
    return liveResult(res.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function cancelSchedule(id: string): Promise<ServiceResult<Schedule | null>> {
  try {
    const client = getDefaultClient();
    const res = await client.post<Schedule>(`/schedules/${encodeURIComponent(id)}/cancel`);
    if (res.error) throw res.error;
    return liveResult(res.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function executeSchedule(
  id: string,
): Promise<ServiceResult<ScheduleExecution | null>> {
  try {
    const client = getDefaultClient();
    const res = await client.post<ScheduleExecution>(
      `/schedules/${encodeURIComponent(id)}/execute`,
    );
    if (res.error) throw res.error;
    return liveResult(res.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}
