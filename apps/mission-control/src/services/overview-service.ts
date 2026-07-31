import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface OverviewData {
  runningAgents: number;
  queuedJobs: number;
  runningWorkflows: number;
  completedToday: number;
  failedToday: number;
  warnings: number;
  criticalAlerts: number;
}

export function placeholderOverview(): OverviewData {
  return {
    runningAgents: 12,
    queuedJobs: 8,
    runningWorkflows: 4,
    completedToday: 47,
    failedToday: 3,
    warnings: 2,
    criticalAlerts: 1,
  };
}

export async function fetchOverview(): Promise<ServiceResult<OverviewData>> {
  try {
    const client = getDefaultClient();
    const [agentsRes, workflowsRes, eventsRes] = await Promise.all([
      client.get<unknown>("/agents/stats"),
      client.get<unknown>("/workflows/stats"),
      client.get<unknown>("/monitoring/events"),
    ]);
    const agents = agentsRes.data as Record<string, unknown> | null;
    const workflows = workflowsRes.data as Record<string, unknown> | null;
    const events = Array.isArray(eventsRes.data) ? (eventsRes.data as Record<string, unknown>[]) : [];

    const num = (v: unknown): number => (typeof v === "number" ? v : Number(v) || 0);
    const warnings = events.filter((e) => String(e.severity ?? e.status) === "warning").length;
    const critical = events.filter((e) => String(e.severity ?? e.status) === "critical" || String(e.severity ?? e.status) === "error").length;

    return liveResult({
      runningAgents: num(agents?.activeAgents ?? agents?.active ?? agents?.running),
      queuedJobs: num(agents?.queued ?? agents?.pending),
      runningWorkflows: num(workflows?.activeRuns ?? workflows?.active ?? workflows?.running),
      completedToday: num(workflows?.completedRuns ?? workflows?.completed),
      failedToday: num(workflows?.failedRuns ?? workflows?.failed),
      warnings,
      criticalAlerts: critical,
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderOverview(), "Backend unavailable");
    }
    throw err;
  }
}
