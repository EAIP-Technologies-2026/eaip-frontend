import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend workforce.py
// ---------------------------------------------------------------------------

export interface WorkerDefinition {
  id: string;
  name: string;
  workerType: string;
  agentId?: string;
  workflowId?: string;
  description?: string;
  tags?: string[];
  maxConcurrentRuns?: number;
  timeoutSeconds?: number;
}

export interface Assignment {
  id: string;
  workerId: string;
  taskDescription?: string;
  status: string;
  result?: unknown;
  error?: string | null;
}

export interface WorkforceMetrics {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  failedAssignments: number;
  avgDurationMs: number;
  workersRegistered: number;
}

export interface WorkforceClient {
  listWorkers(workerType?: string): Promise<WorkerDefinition[]>;
  registerWorker(worker: Omit<WorkerDefinition, "id"> & { id?: string }): Promise<WorkerDefinition>;
  getWorker(workerId: string): Promise<WorkerDefinition>;
  unregisterWorker(workerId: string): Promise<void>;
  assignTask(workerId: string, task: string): Promise<Assignment>;
  listAssignments(workerId?: string): Promise<Assignment[]>;
  getMetrics(): Promise<WorkforceMetrics>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ApiWorkforceClient implements WorkforceClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listWorkers(workerType?: string): Promise<WorkerDefinition[]> {
    const params: Record<string, string> = {};
    if (workerType) params.worker_type = workerType;

    const response = await this.client.get<WorkerDefinition[]>("/workforce/workers", params);
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async registerWorker(worker: Omit<WorkerDefinition, "id"> & { id?: string }): Promise<WorkerDefinition> {
    const response = await this.client.post<WorkerDefinition>("/workforce/workers", worker);
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on worker registration");
    return response.data;
  }

  async getWorker(workerId: string): Promise<WorkerDefinition> {
    const response = await this.client.get<WorkerDefinition>(`/workforce/workers/${workerId}`);
    if (response.error) throw response.error;
    if (!response.data) throw new Error(`Worker ${workerId} not found`);
    return response.data;
  }

  async unregisterWorker(workerId: string): Promise<void> {
    const response = await this.client.delete<Record<string, unknown>>(`/workforce/workers/${workerId}`);
    if (response.error) throw response.error;
  }

  async assignTask(workerId: string, task: string): Promise<Assignment> {
    const response = await this.client.post<Assignment>("/workforce/assignments", { workerId, task });
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on task assignment");
    return response.data;
  }

  async listAssignments(workerId?: string): Promise<Assignment[]> {
    const params: Record<string, string> = {};
    if (workerId) params.worker_id = workerId;

    const response = await this.client.get<Assignment[]>("/workforce/assignments", params);
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getMetrics(): Promise<WorkforceMetrics> {
    const response = await this.client.get<WorkforceMetrics>("/workforce/metrics");
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on workforce metrics");
    return response.data;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createWorkforceClient(client?: ApiClient): WorkforceClient {
  return new ApiWorkforceClient(client);
}
