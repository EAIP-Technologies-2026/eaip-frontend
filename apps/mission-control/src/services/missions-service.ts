import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface Mission {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  startedAt?: string;
  completedAt?: string;
  agentIds: string[];
  workflowIds: string[];
}

export interface MissionStats {
  totalMissions: number;
  running: number;
  completed: number;
  failed: number;
  queued: number;
}

export interface MissionMetrics {
  missionId: string;
  status: string;
  durationMs: number;
  error?: string | null;
  agentCount: number;
  workflowCount: number;
  progress: number;
}

export interface MissionLog {
  timestamp: string;
  level: string;
  message: string;
  source: string;
  [key: string]: unknown;
}

const placeholderMissions: Mission[] = [
  { id: "mis-1", name: "Quarterly Data Analysis", description: "Analyze Q3 financial data across all departments", status: "running", progress: 0.65, startedAt: new Date(Date.now() - 7200000).toISOString(), agentIds: ["agent-1", "agent-2"], workflowIds: ["wf-1"] },
  { id: "mis-2", name: "System Health Check", description: "Comprehensive system health audit", status: "completed", progress: 1, startedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 43200000).toISOString(), agentIds: ["agent-3", "agent-5"], workflowIds: ["wf-2"] },
  { id: "mis-3", name: "Knowledge Base Refresh", description: "Refresh all knowledge base embeddings", status: "pending", progress: 0, agentIds: ["agent-4", "agent-6"], workflowIds: ["wf-3"] },
  { id: "mis-4", name: "Security Audit", description: "Security compliance audit across all agents", status: "running", progress: 0.3, startedAt: new Date(Date.now() - 3600000).toISOString(), agentIds: ["agent-3", "agent-7"], workflowIds: ["wf-2"] },
  { id: "mis-5", name: "Data Pipeline Migration", description: "Migrate data pipelines to new infrastructure", status: "failed", progress: 0.45, startedAt: new Date(Date.now() - 172800000).toISOString(), agentIds: ["agent-8"], workflowIds: ["wf-4"] },
];

const defaultStats: MissionStats = {
  totalMissions: 5,
  running: 2,
  completed: 1,
  failed: 1,
  queued: 1,
};

const defaultMetrics: MissionMetrics = {
  missionId: "unknown",
  status: "idle",
  durationMs: 0,
  agentCount: 0,
  workflowCount: 0,
  progress: 0,
};

export async function fetchMissions(): Promise<ServiceResult<Mission[]>> {
  try {
    const { createMissionsClient } = await import("@eaip/missions");
    const client = createMissionsClient();
    const data = await client.listMissions();
    return liveResult(data as Mission[]);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderMissions, "Backend unavailable");
    }
    throw err;
  }
}

export async function createMission(data: { name: string; description?: string; agentIds?: string[]; workflowIds?: string[] }): Promise<ServiceResult<Mission>> {
  try {
    const { createMissionsClient } = await import("@eaip/missions");
    const client = createMissionsClient();
    const created = await client.createMission({
      name: data.name,
      agent_ids: data.agentIds ?? [],
      workflow_ids: data.workflowIds ?? [],
      metadata: { description: data.description ?? "" },
    });
    return liveResult(created as unknown as Mission);
  } catch (err) {
    if (isNetworkError(err)) {
      const mission: Mission = { id: `mis-mock-${String(Date.now())}`, name: data.name, description: data.description, status: "pending", progress: 0, agentIds: data.agentIds ?? [], workflowIds: data.workflowIds ?? [] };
      return fallbackResult(mission, "Backend unavailable");
    }
    throw err;
  }
}

export async function executeMission(missionId: string): Promise<ServiceResult<{ executionId: string }>> {
  try {
    const { createMissionsClient } = await import("@eaip/missions");
    const client = createMissionsClient();
    const result = await client.executeMission(missionId);
    return liveResult(result);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ executionId: `mock-exec-${String(Date.now())}` }, "Backend unavailable");
    }
    throw err;
  }
}

export async function deleteMission(missionId: string): Promise<ServiceResult<void>> {
  try {
    const { createMissionsClient } = await import("@eaip/missions");
    const client = createMissionsClient();
    await client.deleteMission(missionId);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchMissionStats(): Promise<ServiceResult<MissionStats>> {
  try {
    const { createMissionsClient } = await import("@eaip/missions");
    const client = createMissionsClient();
    const data = await client.getStats();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultStats, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchMissionLogs(missionId: string): Promise<ServiceResult<MissionLog[]>> {
  try {
    const { createMissionsClient } = await import("@eaip/missions");
    const client = createMissionsClient();
    const data = await client.getMissionLogs(missionId);
    return liveResult(data as MissionLog[]);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchMissionMetrics(missionId: string): Promise<ServiceResult<MissionMetrics>> {
  try {
    const { createMissionsClient } = await import("@eaip/missions");
    const client = createMissionsClient();
    const data = await client.getMissionMetrics(missionId);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ ...defaultMetrics, missionId }, "Backend unavailable");
    }
    throw err;
  }
}
