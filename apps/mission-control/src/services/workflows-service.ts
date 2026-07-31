import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import type { WorkflowDefinition, WorkflowRun, WorkflowDesignerGraph, WorkflowVersion } from "@eaip/workflow";

const placeholderWorkflows: WorkflowDefinition[] = [
  { id: "wf-1", name: "Q3 Report Generation", description: "Generates quarterly report", status: "active", steps: [{ id: "s1", name: "Collect Data", agentId: "agent-1" }, { id: "s2", name: "Analyze", agentId: "agent-2" }] },
  { id: "wf-2", name: "Alert Response Pipeline", description: "Handles critical alerts", status: "active", steps: [{ id: "s1", name: "Classify", agentId: "agent-3" }, { id: "s2", name: "Respond", agentId: "agent-7" }] },
  { id: "wf-3", name: "Knowledge Sync", description: "Synchronizes knowledge base", status: "inactive", steps: [{ id: "s1", name: "Index", agentId: "agent-4" }, { id: "s2", name: "Update", agentId: "agent-6" }] },
  { id: "wf-4", name: "Data Pipeline", description: "ETL pipeline for data ingestion", status: "active", steps: [{ id: "s1", name: "Extract", agentId: "agent-8" }, { id: "s2", name: "Transform", agentId: "agent-8" }, { id: "s3", name: "Load", agentId: "agent-8" }] },
];

export async function fetchWorkflows(): Promise<ServiceResult<WorkflowDefinition[]>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.listWorkflows();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderWorkflows, "Backend unavailable");
    }
    throw err;
  }
}

export async function createWorkflow(workflow: Omit<WorkflowDefinition, "id">): Promise<ServiceResult<WorkflowDefinition>> {
  try {
      const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.createWorkflow(workflow);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      const id = `wf-mock-${String(Date.now())}`;
      return fallbackResult({ ...workflow, id }, "Backend unavailable");
    }
    throw err;
  }
}

export async function updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<ServiceResult<WorkflowDefinition>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.updateWorkflow(id, workflow);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ id, name: workflow.name ?? "", steps: workflow.steps ?? [] }, "Backend unavailable");
    }
    throw err;
  }
}

export async function deleteWorkflow(id: string): Promise<ServiceResult<void>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    await client.deleteWorkflow(id);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function startWorkflow(workflowId: string): Promise<ServiceResult<{ runId: string }>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const run = await client.startWorkflow(workflowId);
    return liveResult({ runId: run.id });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ runId: `mock-run-${String(Date.now())}` }, "Backend unavailable");
    }
    throw err;
  }
}

export async function getWorkflow(id: string): Promise<ServiceResult<WorkflowDefinition | null>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.getWorkflow(id);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function listRuns(workflowId: string): Promise<ServiceResult<WorkflowRun[]>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.listRuns(workflowId);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function pauseRun(runId: string): Promise<ServiceResult<void>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    await client.pauseRun(runId);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function resumeRun(runId: string): Promise<ServiceResult<void>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    await client.resumeRun(runId);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function cancelRun(runId: string): Promise<ServiceResult<void>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    await client.cancelRun(runId);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function retryRun(runId: string): Promise<ServiceResult<WorkflowRun>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.retryRun(runId);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({} as WorkflowRun, "Backend unavailable");
    }
    throw err;
  }
}

export async function getDesignerGraph(workflowId: string): Promise<ServiceResult<WorkflowDesignerGraph | null>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.getDesignerGraph(workflowId);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function saveDesignerGraph(workflowId: string, graph: WorkflowDesignerGraph): Promise<ServiceResult<WorkflowDesignerGraph>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.saveDesignerGraph(workflowId, graph);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ nodes: [], edges: [] }, "Backend unavailable");
    }
    throw err;
  }
}

export async function autosaveDesignerGraph(workflowId: string, graph: WorkflowDesignerGraph): Promise<ServiceResult<WorkflowDesignerGraph>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.autosaveDesignerGraph(workflowId, graph);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ nodes: [], edges: [] }, "Backend unavailable");
    }
    throw err;
  }
}

export async function loadAutosave(workflowId: string): Promise<ServiceResult<WorkflowDesignerGraph | null>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.loadAutosave(workflowId);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(null, "Backend unavailable");
    }
    throw err;
  }
}

export async function clearAutosave(workflowId: string): Promise<ServiceResult<void>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    await client.clearAutosave(workflowId);
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(undefined, "Backend unavailable");
    }
    throw err;
  }
}

export async function createVersion(workflowId: string, name: string): Promise<ServiceResult<WorkflowVersion>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.createVersion(workflowId, name);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({} as WorkflowVersion, "Backend unavailable");
    }
    throw err;
  }
}

export async function executeWorkflow(workflowId: string, input?: string): Promise<ServiceResult<WorkflowRun>> {
  try {
    const { createWorkflowClient } = await import("@eaip/workflow");
    const client = createWorkflowClient();
    const data = await client.executeWorkflow(workflowId, input);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({} as WorkflowRun, "Backend unavailable");
    }
    throw err;
  }
}
