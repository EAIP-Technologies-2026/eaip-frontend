import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  totalExecutions: number;
  successRate: number;
  avgLatencyMs: number;
  executionsByDay: { label: string; value: number }[];
  agentsByStatus: { name: string; value: number }[];
  agentsByModel: { name: string; value: number }[];
  topAgents: { name: string; value: number }[];
}

const defaultAgentStats: AgentStats = {
  totalAgents: 8,
  activeAgents: 6,
  totalExecutions: 1247,
  successRate: 0.94,
  avgLatencyMs: 245,
  executionsByDay: [
    { label: "Mon", value: 45 }, { label: "Tue", value: 52 }, { label: "Wed", value: 38 },
    { label: "Thu", value: 61 }, { label: "Fri", value: 42 }, { label: "Sat", value: 18 },
    { label: "Sun", value: 12 },
  ],
  agentsByStatus: [
    { name: "Active", value: 6 }, { name: "Inactive", value: 1 }, { name: "Error", value: 1 },
  ],
  agentsByModel: [
    { name: "GPT-4", value: 4 }, { name: "GPT-3.5", value: 2 }, { name: "Claude", value: 2 },
  ],
  topAgents: [
    { name: "Data Analyzer", value: 342 }, { name: "Code Reviewer", value: 289 },
    { name: "Data Pipeline", value: 215 }, { name: "Knowledge Base", value: 187 },
    { name: "Workflow Executor", value: 156 },
  ],
};

export async function fetchAgentStats(): Promise<ServiceResult<AgentStats>> {
  try {
    const { createAgentClient } = await import("@eaip/agent");
    const agentClient = createAgentClient();

    const [agents, rawStats] = await Promise.all([
      agentClient.listAgents(),
      agentClient.getAgentStats(),
    ]);

    const raw = rawStats as Record<string, unknown> | undefined;

    return liveResult({
      totalAgents: Number(raw?.totalAgents ?? raw?.total ?? agents.length),
      activeAgents: Number(raw?.activeAgents ?? raw?.active ?? agents.filter((a) => a.status === "active").length),
      totalExecutions: Number(raw?.totalExecutions ?? raw?.executions ?? 0),
      successRate: Number(raw?.successRate ?? 0),
      avgLatencyMs: Number(raw?.avgLatencyMs ?? raw?.avgLatency ?? 0),
      executionsByDay: raw && Array.isArray(raw.executionsByDay) ? raw.executionsByDay as { label: string; value: number }[] : [],
      agentsByStatus: raw && Array.isArray(raw.agentsByStatus) ? raw.agentsByStatus as { name: string; value: number }[] : [],
      agentsByModel: raw && Array.isArray(raw.agentsByModel) ? raw.agentsByModel as { name: string; value: number }[] : [],
      topAgents: raw && Array.isArray(raw.topAgents) ? raw.topAgents as { name: string; value: number }[] : [],
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultAgentStats, "Backend unavailable");
    }
    throw err;
  }
}
