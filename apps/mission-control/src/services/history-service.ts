import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface HistoryItem {
  id: string;
  type: "workflow" | "agent";
  name: string;
  status: string;
  targetId: string;
  startedAt?: string;
  completedAt?: string;
}

const placeholderHistory: HistoryItem[] = [
  { id: "run-1", type: "workflow", name: "Q3 Report Generation", status: "completed", targetId: "wf-1", startedAt: new Date(Date.now() - 3600000).toISOString(), completedAt: new Date().toISOString() },
  { id: "run-2", type: "agent", name: "Data Analyzer", status: "completed", targetId: "agent-1", startedAt: new Date(Date.now() - 7200000).toISOString(), completedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "run-3", type: "workflow", name: "Alert Response Pipeline", status: "running", targetId: "wf-2", startedAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "run-4", type: "agent", name: "Code Reviewer", status: "completed", targetId: "agent-2", startedAt: new Date(Date.now() - 14400000).toISOString(), completedAt: new Date(Date.now() - 10800000).toISOString() },
  { id: "run-5", type: "agent", name: "Monitoring Agent", status: "failed", targetId: "agent-3", startedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 82800000).toISOString() },
  { id: "run-6", type: "workflow", name: "Data Pipeline", status: "completed", targetId: "wf-4", startedAt: new Date(Date.now() - 172800000).toISOString(), completedAt: new Date(Date.now() - 169200000).toISOString() },
];

export async function fetchHistory(): Promise<ServiceResult<HistoryItem[]>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const { createAgentClient } = await import("@eaip/agent");
    const workflowClient = createWorkflowClient();
    const agentClient = createAgentClient();

    const [workflows, agents] = await Promise.all([
      workflowClient.listWorkflows(),
      agentClient.listAgents(),
    ]);

    const workflowRuns = (await Promise.all(
      workflows.map(async (workflow) => {
        try {
          const runs = await workflowClient.listRuns(workflow.id);
          return runs.map((run): HistoryItem => ({
            id: run.id,
            type: "workflow",
            name: workflow.name,
            status: run.status,
            targetId: workflow.id,
          }));
        } catch { return []; }
      }),
    )).flat();

    const agentRuns = (await Promise.all(
      agents.map(async (agent) => {
        try {
          const runs = await agentClient.listExecutions(agent.id);
          return runs.map((run): HistoryItem => ({
            id: run.id,
            type: "agent",
            name: agent.name,
            status: run.status,
            targetId: agent.id,
            startedAt: run.startedAt,
            completedAt: run.completedAt,
          }));
        } catch { return []; }
      }),
    )).flat();

    const all = [...workflowRuns, ...agentRuns].sort((a, b) => b.id.localeCompare(a.id));
    return liveResult(all);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderHistory, "Backend unavailable");
    }
    throw err;
  }
}
