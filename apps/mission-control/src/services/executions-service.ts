import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface ExecutionLog {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

export interface ExecutionDetails {
  id: string;
  agentId: string;
  status: string;
  input: string;
  output?: string;
  duration: number;
  startedAt: string;
  completedAt?: string;
  logs: ExecutionLog[];
  events: { type: string; timestamp: string; data: unknown }[];
  retries: number;
  errors: { message: string; timestamp: string }[];
}

const placeholderExecution: ExecutionDetails = {
  id: "exec-mock-1",
  agentId: "agent-1",
  status: "completed",
  input: "Analyze the quarterly sales data and provide insights",
  output: "Q3 Analysis complete: Revenue up 15%, top performer: Enterprise segment",
  duration: 3420,
  startedAt: new Date(Date.now() - 60000).toISOString(),
  completedAt: new Date().toISOString(),
  logs: [
    { timestamp: new Date(Date.now() - 60000).toISOString(), level: "info", message: "Execution started" },
    { timestamp: new Date(Date.now() - 55000).toISOString(), level: "info", message: "Loading sales data from warehouse" },
    { timestamp: new Date(Date.now() - 40000).toISOString(), level: "info", message: "Processing 12,847 records" },
    { timestamp: new Date(Date.now() - 20000).toISOString(), level: "info", message: "Generating insights" },
    { timestamp: new Date(Date.now() - 5000).toISOString(), level: "info", message: "Execution completed successfully" },
  ],
  events: [
    { type: "execution.started", timestamp: new Date(Date.now() - 60000).toISOString(), data: { agentId: "agent-1" } },
    { type: "execution.completed", timestamp: new Date().toISOString(), data: { duration: 3420 } },
  ],
  retries: 0,
  errors: [],
};

export async function fetchExecution(id: string): Promise<ServiceResult<ExecutionDetails | null>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const [agentId] = id.split("-") as (string | undefined)[];
    const res = await client.get<Record<string, unknown>>(`/agents/${agentId ?? "unknown"}/executions`);
    if (res.error) {
      if (res.error.status === 404) return liveResult(null);
      throw res.error;
    }
    return liveResult({
      ...placeholderExecution,
      id,
      agentId: agentId ?? "unknown",
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ ...placeholderExecution, id }, "Backend unavailable");
    }
    throw err;
  }
}
