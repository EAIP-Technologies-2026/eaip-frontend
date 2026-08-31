import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

async function get<T>(path: string, params?: Record<string, string>): Promise<ServiceResult<T>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<T>(path, params);
    if (r.error) throw r.error;
    return liveResult(r.data as T);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null as unknown as T, "Backend unavailable");
    throw err;
  }
}
async function post<T>(
  path: string,
  body: Record<string, unknown> = {},
): Promise<ServiceResult<T>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<T>(path, body);
    if (r.error) throw r.error;
    return liveResult(r.data as T);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null as unknown as T, "Backend unavailable");
    throw err;
  }
}

export const fetchObservabilityEvents = () => get<unknown[]>("/observability/events");
export const fetchTimeline = (correlationId: string) =>
  get<unknown>(`/observability/timeline/${encodeURIComponent(correlationId)}`);
export const fetchEvaluationDashboard = () => get<unknown>("/evaluation/dashboard");
export const fetchCostSummary = () => get<unknown>("/cost-v2/summary");
export const fetchCostForecast = (days = 30) =>
  get<unknown>("/cost-v2/forecast", { days: String(days) });
export const fetchResilience = () => get<unknown>("/resilience/retry-policy");
export const fetchHealthCenter = () => get<unknown>("/health-center/health");
export const fetchIncidents = () => get<unknown[]>("/health-center/incidents");
export const fetchProviderRoute = (capability: string) =>
  post<unknown>("/provider-routing/route", { capability });
export const fetchKpis = () => get<unknown[]>("/kpi");
export const fetchUsageDashboard = () => get<unknown>("/usage/dashboard");
export const fetchApprovals = () => get<unknown[]>("/approval-center");
export const fetchSearchResults = (q: string) => get<unknown>("/search", { q });
export const fetchDeploymentChecklist = () => get<unknown>("/deployment/checklist");
