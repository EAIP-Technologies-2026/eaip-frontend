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

const placeholderMissions: Mission[] = [
  { id: "mis-1", name: "Quarterly Data Analysis", description: "Analyze Q3 financial data across all departments", status: "running", progress: 0.65, startedAt: new Date(Date.now() - 7200000).toISOString(), agentIds: ["agent-1", "agent-2"], workflowIds: ["wf-1"] },
  { id: "mis-2", name: "System Health Check", description: "Comprehensive system health audit", status: "completed", progress: 1, startedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 43200000).toISOString(), agentIds: ["agent-3", "agent-5"], workflowIds: ["wf-2"] },
  { id: "mis-3", name: "Knowledge Base Refresh", description: "Refresh all knowledge base embeddings", status: "pending", progress: 0, agentIds: ["agent-4", "agent-6"], workflowIds: ["wf-3"] },
  { id: "mis-4", name: "Security Audit", description: "Security compliance audit across all agents", status: "running", progress: 0.3, startedAt: new Date(Date.now() - 3600000).toISOString(), agentIds: ["agent-3", "agent-7"], workflowIds: ["wf-2"] },
  { id: "mis-5", name: "Data Pipeline Migration", description: "Migrate data pipelines to new infrastructure", status: "failed", progress: 0.45, startedAt: new Date(Date.now() - 172800000).toISOString(), agentIds: ["agent-8"], workflowIds: ["wf-4"] },
];

export async function fetchMissions(): Promise<ServiceResult<Mission[]>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const response = await client.get<Mission[]>("/missions");
    if (response.error) throw response.error;
    return liveResult(response.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderMissions, "Backend unavailable");
    }
    throw err;
  }
}

export async function createMission(data: { name: string; description?: string; agentIds?: string[]; workflowIds?: string[] }): Promise<ServiceResult<Mission>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const response = await client.post<Mission>("/missions", {
      name: data.name,
      description: data.description,
      agent_ids: data.agentIds ?? [],
      workflow_ids: data.workflowIds ?? [],
    });
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response");
    return liveResult(response.data);
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
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const response = await client.post<{ executionId: string }>(`/missions/${missionId}/execute`, {});
    if (response.error) throw response.error;
    return liveResult(response.data ?? { executionId: missionId });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ executionId: `mock-exec-${String(Date.now())}` }, "Backend unavailable");
    }
    throw err;
  }
}

export async function deleteMission(missionId: string): Promise<ServiceResult<void>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const response = await client.delete<Record<string, unknown>>(`/missions/${missionId}`);
    if (response.error) throw response.error;
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}
