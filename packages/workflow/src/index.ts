import { getDefaultClient, type ApiClient } from "@eaip/api";
import type { Edge, Node } from "@xyflow/react";

export interface WorkflowStep {
  id: string;
  name: string;
  agentId: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  status?: string;
  steps: WorkflowStep[];
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed";
  currentStep: string | null;
}

export type WorkflowNodeType = "start" | "end" | "ai" | "condition" | "human";

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  type: WorkflowNodeType;
  agentId?: string;
}

export type WorkflowDesignerNode = Node<WorkflowNodeData>;

export type WorkflowDesignerEdge = Edge;

export interface WorkflowDesignerGraph {
  nodes: WorkflowDesignerNode[];
  edges: WorkflowDesignerEdge[];
}

export interface WorkflowVersion {
  id: string;
  workflowId: string;
  name: string;
  createdAt: string;
}

export interface WorkflowClient {
  listWorkflows(): Promise<WorkflowDefinition[]>;
  getWorkflow(id: string): Promise<WorkflowDefinition | null>;
  createWorkflow(workflow: Omit<WorkflowDefinition, "id">): Promise<WorkflowDefinition>;
  updateWorkflow(id: string, workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition>;
  deleteWorkflow(id: string): Promise<void>;
  startWorkflow(workflowId: string): Promise<WorkflowRun>;
  executeWorkflow(workflowId: string, input?: string): Promise<WorkflowRun>;
  getRun(runId: string): Promise<WorkflowRun | null>;
  listRuns(workflowId: string): Promise<WorkflowRun[]>;
  pauseRun(runId: string): Promise<void>;
  resumeRun(runId: string): Promise<void>;
  cancelRun(runId: string): Promise<void>;
  retryRun(runId: string): Promise<WorkflowRun>;

  // Designer API
  getDesignerGraph(workflowId: string): Promise<WorkflowDesignerGraph | null>;
  saveDesignerGraph(workflowId: string, graph: WorkflowDesignerGraph): Promise<WorkflowDesignerGraph>;
  autosaveDesignerGraph(workflowId: string, graph: WorkflowDesignerGraph): Promise<WorkflowDesignerGraph>;
  loadAutosave(workflowId: string): Promise<WorkflowDesignerGraph | null>;
  clearAutosave(workflowId: string): Promise<void>;
  createVersion(workflowId: string, name: string): Promise<WorkflowVersion>;
}

export class ApiWorkflowClient implements WorkflowClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listWorkflows(): Promise<WorkflowDefinition[]> {
    const response = await this.client.get<WorkflowDefinition[]>("/workflows");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    const response = await this.client.get<WorkflowDefinition>(`/workflows/${id}`);
    if (response.error) {
      if (response.error.status === 404) return null;
      throw response.error;
    }
    return response.data;
  }

  async createWorkflow(workflow: Omit<WorkflowDefinition, "id">): Promise<WorkflowDefinition> {
    const response = await this.client.post<WorkflowDefinition>("/workflows", workflow);
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Create workflow returned empty response");
    }
    return response.data;
  }

  async updateWorkflow(
    id: string,
    workflow: Partial<WorkflowDefinition>,
  ): Promise<WorkflowDefinition> {
    const response = await this.client.put<WorkflowDefinition>(`/workflows/${id}`, workflow);
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Update workflow returned empty response");
    }
    return response.data;
  }

  async deleteWorkflow(id: string): Promise<void> {
    const response = await this.client.delete<Record<string, unknown>>(`/workflows/${id}`);
    if (response.error) throw response.error;
  }

  async startWorkflow(workflowId: string): Promise<WorkflowRun> {
    const response = await this.client.post<WorkflowRun>(`/workflows/${workflowId}/start`, {});
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Start workflow returned empty response");
    }
    return response.data;
  }

  async executeWorkflow(workflowId: string, input?: string): Promise<WorkflowRun> {
    const response = await this.client.post<WorkflowRun>(`/workflows/${workflowId}/execute`, {
      input,
    });
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Execute workflow returned empty response");
    }
    return response.data;
  }

  async getRun(runId: string): Promise<WorkflowRun | null> {
    const response = await this.client.get<WorkflowRun>(`/workflows/runs/${runId}`);
    if (response.error) {
      if (response.error.status === 404) return null;
      throw response.error;
    }
    return response.data;
  }

  async listRuns(workflowId: string): Promise<WorkflowRun[]> {
    const response = await this.client.get<WorkflowRun[]>(`/workflows/${workflowId}/executions`);
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async pauseRun(runId: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(
      `/workflows/executions/${runId}/pause`,
      {},
    );
    if (response.error) throw response.error;
  }

  async resumeRun(runId: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(
      `/workflows/executions/${runId}/resume`,
      {},
    );
    if (response.error) throw response.error;
  }

  async cancelRun(runId: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(
      `/workflows/executions/${runId}/cancel`,
      {},
    );
    if (response.error) throw response.error;
  }

  async retryRun(runId: string): Promise<WorkflowRun> {
    const response = await this.client.post<WorkflowRun>(
      `/workflows/executions/${runId}/retry`,
      {},
    );
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Retry workflow run returned empty response");
    }
    return response.data;
  }

  async getDesignerGraph(workflowId: string): Promise<WorkflowDesignerGraph | null> {
    const response = await this.client.get<WorkflowDesignerGraph>(`/designer/${workflowId}`);
    if (response.error) {
      if (response.error.status === 404) return null;
      throw response.error;
    }
    return response.data ?? { nodes: [], edges: [] };
  }

  async saveDesignerGraph(
    workflowId: string,
    graph: WorkflowDesignerGraph,
  ): Promise<WorkflowDesignerGraph> {
    const response = await this.client.put<WorkflowDesignerGraph>(`/designer/${workflowId}`, graph);
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Save designer graph returned empty response");
    }
    return response.data;
  }

  async autosaveDesignerGraph(
    workflowId: string,
    graph: WorkflowDesignerGraph,
  ): Promise<WorkflowDesignerGraph> {
    const response = await this.client.post<WorkflowDesignerGraph>(
      `/designer/${workflowId}/autosave`,
      graph,
    );
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Autosave designer graph returned empty response");
    }
    return response.data;
  }

  async loadAutosave(workflowId: string): Promise<WorkflowDesignerGraph | null> {
    const response = await this.client.get<WorkflowDesignerGraph>(
      `/designer/${workflowId}/autosave`,
    );
    if (response.error) {
      if (response.error.status === 404) return null;
      throw response.error;
    }
    return response.data ?? { nodes: [], edges: [] };
  }

  async clearAutosave(workflowId: string): Promise<void> {
    const response = await this.client.delete<Record<string, unknown>>(
      `/designer/${workflowId}/autosave`,
    );
    if (response.error) throw response.error;
  }

  async createVersion(workflowId: string, name: string): Promise<WorkflowVersion> {
    const response = await this.client.post<WorkflowVersion>(`/workflows/${workflowId}/versions`, {
      name,
    });
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Create version returned empty response");
    }
    return response.data;
  }
}

const stepNodeTypes = new Set<WorkflowNodeType>(["ai", "condition", "human"]);

export function graphToWorkflowSteps(graph: WorkflowDesignerGraph): WorkflowStep[] {
  return graph.nodes
    .filter((node) => stepNodeTypes.has(node.data.type))
    .map((node) => ({
      id: node.id,
      name: node.data.label,
      agentId:
        node.data.agentId ??
        (node.data.type === "human" ? "human" : node.data.type === "condition" ? "condition" : "agent"),
    }));
}

export function createWorkflowClient(client?: ApiClient): WorkflowClient {
  return new ApiWorkflowClient(client);
}
