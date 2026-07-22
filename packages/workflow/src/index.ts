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
  getWorkflow(id: string): Promise<WorkflowDefinition | null>;
  startWorkflow(workflowId: string): Promise<WorkflowRun>;
  getRun(runId: string): Promise<WorkflowRun | null>;
}

export class ApiWorkflowClient implements WorkflowClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    try {
      const res = await fetch(`${this.baseUrl}/workflows/${id}`);
      return res.ok ? ((await res.json()) as WorkflowDefinition) : null;
    } catch {
      return null;
    }
  }

  async startWorkflow(workflowId: string): Promise<WorkflowRun> {
    const res = await fetch(`${this.baseUrl}/workflows/${workflowId}/start`, { method: "POST" });
    return res.json() as Promise<WorkflowRun>;
  }

  async getRun(runId: string): Promise<WorkflowRun | null> {
    try {
      const res = await fetch(`${this.baseUrl}/workflows/runs/${runId}`);
      return res.ok ? ((await res.json()) as WorkflowRun) : null;
    } catch {
      return null;
    }
  }
}
