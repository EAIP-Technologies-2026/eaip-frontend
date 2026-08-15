import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend missions.py + mission_analytics.py
// ---------------------------------------------------------------------------

export interface Mission {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  startedAt?: string | null;
  completedAt?: string | null;
  steps?: unknown[];
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

export interface MissionsClient {
  getStats(): Promise<MissionStats>;
  listMissions(): Promise<Mission[]>;
  createMission(mission: { name: string; agent_ids?: string[]; workflow_ids?: string[]; knowledge_collections?: string[]; metadata?: Record<string, unknown> }): Promise<Mission>;
  getMission(missionId: string): Promise<Mission>;
  deleteMission(missionId: string): Promise<{ status: string }>;
  executeMission(missionId: string): Promise<{ executionId: string }>;
  getMissionLogs(missionId: string): Promise<MissionLog[]>;
  getMissionMetrics(missionId: string): Promise<MissionMetrics>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ApiMissionsClient implements MissionsClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async getStats(): Promise<MissionStats> {
    const response = await this.client.get<MissionStats>("/missions/stats");
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on mission stats");
    return response.data;
  }

  async listMissions(): Promise<Mission[]> {
    const response = await this.client.get<Mission[]>("/missions");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async createMission(mission: { name: string; agent_ids?: string[]; workflow_ids?: string[]; knowledge_collections?: string[]; metadata?: Record<string, unknown> }): Promise<Mission> {
    const response = await this.client.post<Mission>("/missions", mission);
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on mission creation");
    return response.data;
  }

  async getMission(missionId: string): Promise<Mission> {
    const response = await this.client.get<Mission>(`/missions/${missionId}`);
    if (response.error) throw response.error;
    if (!response.data) throw new Error(`Mission ${missionId} not found`);
    return response.data;
  }

  async deleteMission(missionId: string): Promise<{ status: string }> {
    const response = await this.client.delete<{ status: string }>(`/missions/${missionId}`);
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on mission deletion");
    return response.data;
  }

  async executeMission(missionId: string): Promise<{ executionId: string }> {
    const response = await this.client.post<{ executionId: string }>(`/missions/${missionId}/execute`, {});
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on mission execution");
    return response.data;
  }

  async getMissionLogs(missionId: string): Promise<MissionLog[]> {
    const response = await this.client.get<MissionLog[]>(`/missions/${missionId}/logs`);
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getMissionMetrics(missionId: string): Promise<MissionMetrics> {
    const response = await this.client.get<MissionMetrics>(`/missions/${missionId}/analytics/metrics`);
    if (response.error) throw response.error;
    if (!response.data) throw new Error(`Analytics metrics for mission ${missionId} not found`);
    return response.data;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createMissionsClient(client?: ApiClient): MissionsClient {
  return new ApiMissionsClient(client);
}
