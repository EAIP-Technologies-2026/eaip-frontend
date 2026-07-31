import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface WorkflowStats {
  totalWorkflows: number;
  activeRuns: number;
  completedRuns: number;
  failedRuns: number;
  avgDurationMs: number;
  runsByDay: { label: string; value: number }[];
  runsByStatus: { name: string; value: number }[];
}

export interface MissionStats {
  totalMissions: number;
  activeMissions: number;
  completedMissions: number;
  successRate: number;
  missionsByDay: { label: string; value: number }[];
  missionsByStatus: { name: string; value: number }[];
}

export interface RuntimeMetrics {
  activeWorkers: number;
  queueDepth: number;
  cpuUsage: number;
  memoryUsage: number;
  healthy: boolean;
  throughputPerMinute: number;
  latencyP95Ms: number;
}

const defaultWorkflowStats: WorkflowStats = {
  totalWorkflows: 12,
  activeRuns: 4,
  completedRuns: 156,
  failedRuns: 8,
  avgDurationMs: 3450,
  runsByDay: [
    { label: "Mon", value: 22 }, { label: "Tue", value: 18 }, { label: "Wed", value: 25 },
    { label: "Thu", value: 15 }, { label: "Fri", value: 20 }, { label: "Sat", value: 10 },
    { label: "Sun", value: 8 },
  ],
  runsByStatus: [
    { name: "Completed", value: 156 }, { name: "Failed", value: 8 },
    { name: "Running", value: 4 }, { name: "Pending", value: 6 },
  ],
};

const defaultMissionStats: MissionStats = {
  totalMissions: 8,
  activeMissions: 2,
  completedMissions: 5,
  successRate: 0.85,
  missionsByDay: [
    { label: "Mon", value: 2 }, { label: "Tue", value: 1 }, { label: "Wed", value: 3 },
    { label: "Thu", value: 0 }, { label: "Fri", value: 2 }, { label: "Sat", value: 0 },
    { label: "Sun", value: 0 },
  ],
  missionsByStatus: [
    { name: "Completed", value: 5 }, { name: "Running", value: 2 },
    { name: "Failed", value: 1 }, { name: "Pending", value: 0 },
  ],
};

const defaultRuntimeMetrics: RuntimeMetrics = {
  activeWorkers: 6,
  queueDepth: 12,
  cpuUsage: 62,
  memoryUsage: 74,
  healthy: true,
  throughputPerMinute: 8.5,
  latencyP95Ms: 145,
};

export async function fetchWorkflowStats(): Promise<ServiceResult<WorkflowStats>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const res = await client.get<unknown>("/workflows/stats");
    if (res.error) throw res.error;
    const raw = res.data as Record<string, unknown> | undefined;
    return liveResult({
      totalWorkflows: Number(raw?.totalWorkflows ?? raw?.total ?? 0),
      activeRuns: Number(raw?.activeRuns ?? raw?.active ?? 0),
      completedRuns: Number(raw?.completedRuns ?? raw?.completed ?? 0),
      failedRuns: Number(raw?.failedRuns ?? raw?.failed ?? 0),
      avgDurationMs: Number(raw?.avgDurationMs ?? raw?.avgDuration ?? 0),
      runsByDay: raw && Array.isArray(raw.runsByDay) ? raw.runsByDay as { label: string; value: number }[] : [],
      runsByStatus: raw && Array.isArray(raw.runsByStatus) ? raw.runsByStatus as { name: string; value: number }[] : [],
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultWorkflowStats, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchMissionStats(): Promise<ServiceResult<MissionStats>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const res = await client.get<unknown>("/missions");
    if (res.error) throw res.error;
    const raw = res.data as Record<string, unknown> | undefined;
    return liveResult({
      totalMissions: Number(raw?.totalMissions ?? raw?.total ?? 0),
      activeMissions: Number(raw?.activeMissions ?? raw?.active ?? 0),
      completedMissions: Number(raw?.completedMissions ?? raw?.completed ?? 0),
      successRate: Number(raw?.successRate ?? 0),
      missionsByDay: raw && Array.isArray(raw.missionsByDay) ? raw.missionsByDay as { label: string; value: number }[] : [],
      missionsByStatus: raw && Array.isArray(raw.missionsByStatus) ? raw.missionsByStatus as { name: string; value: number }[] : [],
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultMissionStats, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchRuntimeMetrics(): Promise<ServiceResult<RuntimeMetrics>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const res = await client.get<unknown>("/system/health");
    if (res.error) throw res.error;
    const raw = res.data as Record<string, unknown> | undefined;
    return liveResult({
      activeWorkers: Number(raw?.activeWorkers ?? raw?.workers ?? 0),
      queueDepth: Number(raw?.queueDepth ?? raw?.queued ?? 0),
      cpuUsage: Number(raw?.cpuUsage ?? raw?.cpu ?? 0),
      memoryUsage: Number(raw?.memoryUsage ?? raw?.memory ?? 0),
      healthy: raw?.healthy === true || raw?.overall === "healthy",
      throughputPerMinute: Number(raw?.throughputPerMinute ?? 0),
      latencyP95Ms: Number(raw?.latencyP95Ms ?? raw?.latency ?? 0),
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultRuntimeMetrics, "Backend unavailable");
    }
    throw err;
  }
}
