import { getDefaultClient } from "@eaip/api";
import type { Agent } from "@eaip/agent";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockStats, createMockActivityFeed, createMockAgents } from "../mock-data/data";

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  totalExecutions: number;
  successRate: number;
  executionsByDay?: { label: string; value: number }[];
  agentsByStatus?: { name: string; value: number }[];
}

export interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: string;
  actor?: string;
}

const defaultStats: AgentStats = {
  totalAgents: 0,
  activeAgents: 0,
  totalExecutions: 0,
  successRate: 0,
  executionsByDay: [],
  agentsByStatus: [],
};

function parseStats(data: unknown): AgentStats {
  if (!data || typeof data !== "object") return defaultStats;
  const obj = data as Record<string, unknown>;
  const num = (v: unknown): number => (typeof v === "number" ? v : Number(v) || 0);
  return {
    totalAgents: num(obj.totalAgents ?? obj.total ?? obj.agentCount),
    activeAgents: num(obj.activeAgents ?? obj.active ?? obj.runningAgents ?? obj.running),
    totalExecutions: num(obj.totalExecutions ?? obj.executions ?? obj.totalRuns ?? obj.runs),
    successRate: num(obj.successRate ?? obj.success ?? obj.avgSuccessRate),
    executionsByDay: Array.isArray(obj.executionsByDay)
      ? obj.executionsByDay.map((item) => ({
          label: (item as { label?: string }).label ?? "",
          value: (item as { value?: number }).value ?? 0,
        }))
      : [],
    agentsByStatus: Array.isArray(obj.agentsByStatus)
      ? obj.agentsByStatus.map((item) => ({
          name: (item as { name?: string }).name ?? "",
          value: (item as { value?: number }).value ?? 0,
        }))
      : [],
  };
}

export async function fetchAgentStats(): Promise<ServiceResult<AgentStats>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<unknown>("/agents/stats");
    if (response.error) throw response.error;
    return liveResult(parseStats(response.data));
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(createMockStats(), err instanceof Error ? err.message : "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchRecentAgents(): Promise<ServiceResult<Agent[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<Agent[]>("/agents");
    if (response.error) throw response.error;
    return liveResult(response.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(createMockAgents().slice(0, 10), err instanceof Error ? err.message : "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchDashboardActivity(): Promise<ServiceResult<ActivityItem[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<unknown>("/monitoring/events");
    if (response.error) throw response.error;
    const raw: Record<string, unknown>[] = Array.isArray(response.data) ? response.data as Record<string, unknown>[] : [];
    const items: ActivityItem[] = raw.map((obj, index) => {
      return {
        id: typeof obj.id === "string" ? obj.id : String(index),
        title: typeof obj.title === "string" ? obj.title : typeof obj.action === "string" ? obj.action : typeof obj.type === "string" ? obj.type : "Event",
        description: typeof obj.description === "string" ? obj.description : typeof obj.message === "string" ? obj.message : "",
        timestamp: typeof obj.timestamp === "string" ? obj.timestamp : new Date().toISOString(),
        type: typeof obj.severity === "string" ? obj.severity : typeof obj.status === "string" ? obj.status : "info",
        actor: typeof obj.actor === "string" ? obj.actor : undefined,
      };
    });
    return liveResult(items);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        createMockActivityFeed().map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          timestamp: item.timestamp,
          type: item.type ?? "info",
          actor: item.actor,
        })),
        err instanceof Error ? err.message : "Backend unavailable",
      );
    }
    throw err;
  }
}
