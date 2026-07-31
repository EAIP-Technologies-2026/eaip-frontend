import { getDefaultClient, type ApiClient } from "@eaip/api";

export interface AgentTool {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  type?: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status?: string;
  model?: string;
  systemPrompt?: string;
  tools?: AgentTool[];
  knowledge?: string[];
  memory?: string[];
  labels?: string[];
  tags?: string[];
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
  metrics?: {
    totalExecutions?: number;
    successRate?: number;
    avgLatencyMs?: number;
  };
}

export interface AgentExecution {
  id: string;
  agentId: string;
  status: "pending" | "running" | "completed" | "failed";
  output?: string;
  input?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
}

export interface AgentEvent {
  id: string;
  type: string;
  data: unknown;
  timestamp: string;
}

export interface AgentClient {
  listAgents(): Promise<Agent[]>;
  createAgent(name: string, description?: string): Promise<Agent>;
  getAgent(id: string): Promise<Agent | null>;
  updateAgent(id: string, updates: Partial<Agent>): Promise<Agent>;
  deleteAgent(id: string): Promise<void>;
  archiveAgent(id: string): Promise<void>;
  duplicateAgent(id: string): Promise<Agent>;
  executeAgent(id: string, input: string): Promise<AgentExecution>;
  listExecutions(id: string): Promise<AgentExecution[]>;
  pauseExecution(id: string, executionId: string): Promise<void>;
  resumeExecution(id: string, executionId: string): Promise<void>;
  stopExecution(id: string, executionId: string): Promise<void>;
  retryExecution(id: string, executionId: string): Promise<AgentExecution>;
  getAgentEvents(id: string, limit?: number): Promise<AgentEvent[]>;
}

export class ApiAgentClient implements AgentClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listAgents(): Promise<Agent[]> {
    const response = await this.client.get<Agent[]>("/agents");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async createAgent(name: string, description?: string): Promise<Agent> {
    const response = await this.client.post<Agent>("/agents", { name, description });
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Create agent returned empty response");
    }
    return response.data;
  }

  async getAgent(id: string): Promise<Agent | null> {
    const response = await this.client.get<Agent>(`/agents/${id}`);
    if (response.error) {
      if (response.error.status === 404) return null;
      throw response.error;
    }
    return response.data;
  }

  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent> {
    const response = await this.client.put<Agent>(`/agents/${id}`, updates);
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Update agent returned empty response");
    }
    return response.data;
  }

  async deleteAgent(id: string): Promise<void> {
    const response = await this.client.delete<Record<string, unknown>>(`/agents/${id}`);
    if (response.error) throw response.error;
  }

  async archiveAgent(id: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(`/agents/${id}/archive`, {});
    if (response.error) throw response.error;
  }

  async duplicateAgent(id: string): Promise<Agent> {
    const response = await this.client.post<Agent>(`/agents/${id}/duplicate`, {});
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Duplicate agent returned empty response");
    }
    return response.data;
  }

  async executeAgent(id: string, input: string): Promise<AgentExecution> {
    const response = await this.client.post<AgentExecution>(`/agents/${id}/execute`, { input });
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Execute agent returned empty response");
    }
    return response.data;
  }

  async listExecutions(id: string): Promise<AgentExecution[]> {
    const response = await this.client.get<AgentExecution[]>(`/agents/${id}/executions`);
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getAgentEvents(id: string, limit?: number): Promise<AgentEvent[]> {
    const response = await this.client.get<AgentEvent[]>(`/agents/${id}/events`, {
      limit: limit ? String(limit) : undefined,
    });
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async pauseExecution(id: string, executionId: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(
      `/agents/${id}/executions/${executionId}/pause`,
      {},
    );
    if (response.error) throw response.error;
  }

  async resumeExecution(id: string, executionId: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(
      `/agents/${id}/executions/${executionId}/resume`,
      {},
    );
    if (response.error) throw response.error;
  }

  async stopExecution(id: string, executionId: string): Promise<void> {
    const response = await this.client.post<Record<string, unknown>>(
      `/agents/${id}/executions/${executionId}/stop`,
      {},
    );
    if (response.error) throw response.error;
  }

  async retryExecution(id: string, executionId: string): Promise<AgentExecution> {
    const response = await this.client.post<AgentExecution>(
      `/agents/${id}/executions/${executionId}/retry`,
      {},
    );
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Retry execution returned empty response");
    }
    return response.data;
  }
}

export function createAgentClient(client?: ApiClient): AgentClient {
  return new ApiAgentClient(client);
}
