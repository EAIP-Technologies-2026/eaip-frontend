import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend deployments.py
// ---------------------------------------------------------------------------

export interface Deployment {
  id: string;
  name?: string;
  status: string;
  version?: string;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface DeploymentsClient {
  listDeployments(): Promise<Deployment[]>;
  createDeployment(config?: Record<string, unknown>): Promise<{ id: string; status: string }>;
  getDeployment(deploymentId: string): Promise<Deployment>;
  rollbackDeployment(deploymentId: string): Promise<{ id: string; status: string }>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ApiDeploymentsClient implements DeploymentsClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listDeployments(): Promise<Deployment[]> {
    const response = await this.client.get<Deployment[]>("/deployments");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async createDeployment(config?: Record<string, unknown>): Promise<{ id: string; status: string }> {
    const response = await this.client.post<{ id: string; status: string }>("/deployments", config ?? {});
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on deployment creation");
    return response.data;
  }

  async getDeployment(deploymentId: string): Promise<Deployment> {
    const response = await this.client.get<Deployment>(`/deployments/${deploymentId}`);
    if (response.error) throw response.error;
    if (!response.data) throw new Error(`Deployment ${deploymentId} not found`);
    return response.data;
  }

  async rollbackDeployment(deploymentId: string): Promise<{ id: string; status: string }> {
    const response = await this.client.post<{ id: string; status: string }>(`/deployments/${deploymentId}/rollback`, {});
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on deployment rollback");
    return response.data;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createDeploymentsClient(client?: ApiClient): DeploymentsClient {
  return new ApiDeploymentsClient(client);
}
