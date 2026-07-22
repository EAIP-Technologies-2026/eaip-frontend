import { getDefaultClient, type ApiClient } from "@eaip/api";

export interface WorkflowDefinition {
  id: string;
  name: string;
  steps: { id: string; name: string; agentId: string }[];
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed";
  currentStep: string | null;
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
}

export function createWorkflowClient(client?: ApiClient): WorkflowClient {
  return new ApiWorkflowClient(client);
}
