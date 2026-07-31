import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface AgentFleetItem {
  id: string;
  name: string;
  status: string;
  health: "healthy" | "degraded" | "down";
  cpu: number;
  memory: number;
  owner: string;
  capabilities: string[];
  version: string;
  currentTask?: string;
}

const demoAgents: AgentFleetItem[] = [
  { id: "agent-1", name: "Data Analyzer", status: "active", health: "healthy", cpu: 45, memory: 62, owner: "Alex Rivera", capabilities: ["analysis", "nlp"], version: "2.1.0", currentTask: "Processing Q3 report" },
  { id: "agent-2", name: "Code Reviewer", status: "active", health: "healthy", cpu: 30, memory: 45, owner: "Sam Chen", capabilities: ["code-review", "linting"], version: "1.8.3", currentTask: "Reviewing PR #847" },
  { id: "agent-3", name: "Monitoring Agent", status: "active", health: "degraded", cpu: 78, memory: 91, owner: "Jordan Patel", capabilities: ["monitoring", "alerting"], version: "3.0.1", currentTask: "High memory usage" },
  { id: "agent-4", name: "Search Indexer", status: "inactive", health: "down", cpu: 0, memory: 12, owner: "Morgan Lee", capabilities: ["search", "indexing"], version: "1.2.0" },
  { id: "agent-5", name: "Workflow Executor", status: "active", health: "healthy", cpu: 55, memory: 58, owner: "Casey Kim", capabilities: ["execution", "orchestration"], version: "2.3.1", currentTask: "Running workflow wf-42" },
  { id: "agent-6", name: "Knowledge Base", status: "active", health: "healthy", cpu: 22, memory: 35, owner: "Riley Johnson", capabilities: ["knowledge", "retrieval"], version: "1.5.2", currentTask: "Updating embeddings" },
  { id: "agent-7", name: "Alert Responder", status: "error", health: "degraded", cpu: 88, memory: 76, owner: "Taylor Brown", capabilities: ["alerting", "response"], version: "2.0.0", currentTask: "Handling critical alert" },
  { id: "agent-8", name: "Data Pipeline", status: "active", health: "healthy", cpu: 35, memory: 41, owner: "Quinn Davis", capabilities: ["etl", "transformation"], version: "1.9.0", currentTask: "Processing data stream" },
];

export async function fetchAgentFleet(): Promise<ServiceResult<AgentFleetItem[]>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const res = await client.get<unknown[]>("/agents");
    if (res.error) throw res.error;
    const items: AgentFleetItem[] = (res.data ?? []).map((item: unknown) => {
      const a = item as Record<string, unknown>;
      const metrics = a.metrics as Record<string, unknown> | undefined;
      return {
        id: (a.id as string | undefined) ?? "",
        name: (a.name as string | undefined) ?? "",
        status: (a.status as string | undefined) ?? "unknown",
        health: "healthy",
        cpu: (a.cpu as number | undefined) ?? (metrics?.cpu as number | undefined) ?? 0,
        memory: (a.memory as number | undefined) ?? (metrics?.memory as number | undefined) ?? 0,
        owner: (a.owner as string | undefined) ?? "system",
        capabilities: Array.isArray(a.capabilities) ? (a.capabilities as string[]).map(String) : [],
        version: (a.version as string | undefined) ?? "0.0.0",
        currentTask: a.currentTask as string | undefined,
      };
    });
    return liveResult(items);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(demoAgents, "Backend unavailable");
    }
    throw err;
  }
}
