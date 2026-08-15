import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend runtime.py
// ---------------------------------------------------------------------------

export interface RuntimeMetrics {
  cpuPercent: number;
  memoryPercent: number;
  memoryUsed: string;
  memoryTotal: string;
  avgLatencyMs: number;
  runningAgents: number;
  runningWorkflows: number;
  knowledgeJobs: number;
  uptime: string;
}

export interface ServiceHealth {
  service: string;
  status: string;
  uptime: string;
  version: string;
  message?: string;
  lastChecked?: string;
}

export interface ServiceStatus {
  service: string;
  status: string;
  uptime: string;
  version: string;
}

export interface RuntimeClient {
  getMetrics(): Promise<RuntimeMetrics>;
  getHealth(): Promise<ServiceHealth[]>;
  getStatus(): Promise<ServiceStatus[]>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ApiRuntimeClient implements RuntimeClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async getMetrics(): Promise<RuntimeMetrics> {
    const response = await this.client.get<RuntimeMetrics>("/runtime/metrics");
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Runtime metrics response is empty");
    return response.data;
  }

  async getHealth(): Promise<ServiceHealth[]> {
    const response = await this.client.get<ServiceHealth[]>("/runtime/health");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getStatus(): Promise<ServiceStatus[]> {
    const response = await this.client.get<ServiceStatus[]>("/runtime/status");
    if (response.error) throw response.error;
    return response.data ?? [];
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createRuntimeClient(client?: ApiClient): RuntimeClient {
  return new ApiRuntimeClient(client);
}
