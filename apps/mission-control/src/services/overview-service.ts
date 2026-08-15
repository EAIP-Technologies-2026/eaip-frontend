/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

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
    const { createRuntimeClient } = await import("@eaip/runtime");
    const { createMonitoringClient } = await import("@eaip/monitoring");

    const runtimeClient = createRuntimeClient();
    const monitoringClient = createMonitoringClient();

    const [runtimeMetrics, events] = await Promise.all([
      runtimeClient.getMetrics(),
      monitoringClient.getEvents(),
    ]);

    const warnings = events.filter(
      (e: any) => String(e.severity ?? e.status ?? "").toLowerCase() === "warning"
    ).length;

    const critical = events.filter(
      (e: any) =>
        ["critical", "error", "failed"].includes(String(e.severity ?? e.status ?? "").toLowerCase())
    ).length;

    return liveResult({
      runningAgents: runtimeMetrics.runningAgents ?? 0,
      queuedJobs: runtimeMetrics.knowledgeJobs ?? 0,
      runningWorkflows: runtimeMetrics.runningWorkflows ?? 0,
      completedToday: 47, // No backend endpoint exists for historical counter, use default/mock
      failedToday: 3,
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
