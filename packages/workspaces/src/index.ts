import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend workspaces.py
// ---------------------------------------------------------------------------

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  status: string;
  resourceCount?: number;
  resourceIds?: string[];
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface WorkspacesClient {
  listWorkspaces(ownerId?: string): Promise<Workspace[]>;
  createWorkspace(workspace: { name: string; id?: string }): Promise<Workspace>;
  listSharedWorkspaces(): Promise<Workspace[]>;
  getWorkspace(workspaceId: string): Promise<Workspace>;
  updateWorkspace(workspaceId: string, name: string): Promise<{ id: string; name: string; status: string; updatedAt: string }>;
  archiveWorkspace(workspaceId: string): Promise<{ status: string; workspaceId: string }>;
  addResource(workspaceId: string, resourceId: string): Promise<{ status: string; workspaceId: string; resourceId: string }>;
  removeResource(workspaceId: string, resourceId: string): Promise<{ status: string; workspaceId: string; resourceId: string }>;
  shareWorkspace(workspaceId: string, userId: string): Promise<{ status: string; workspaceId: string; sharedWith: string }>;
  unshareWorkspace(workspaceId: string, userId: string): Promise<{ status: string; workspaceId: string; unsharedWith: string }>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ApiWorkspacesClient implements WorkspacesClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listWorkspaces(ownerId?: string): Promise<Workspace[]> {
    const params: Record<string, string> = {};
    if (ownerId) params.owner_id = ownerId;

    const response = await this.client.get<Workspace[]>("/workspaces", params);
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async createWorkspace(workspace: { name: string; id?: string }): Promise<Workspace> {
    const response = await this.client.post<Workspace>("/workspaces", workspace);
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on workspace creation");
    return response.data;
  }

  async listSharedWorkspaces(): Promise<Workspace[]> {
    const response = await this.client.get<Workspace[]>("/workspaces/shared");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const response = await this.client.get<Workspace>(`/workspaces/${workspaceId}`);
    if (response.error) throw response.error;
    if (!response.data) throw new Error(`Workspace ${workspaceId} not found`);
    return response.data;
  }

  async updateWorkspace(workspaceId: string, name: string): Promise<{ id: string; name: string; status: string; updatedAt: string }> {
    const response = await this.client.put<{ id: string; name: string; status: string; updatedAt: string }>(
      `/workspaces/${workspaceId}`,
      { name }
    );
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on workspace update");
    return response.data;
  }

  async archiveWorkspace(workspaceId: string): Promise<{ status: string; workspaceId: string }> {
    const response = await this.client.post<{ status: string; workspaceId: string }>(`/workspaces/${workspaceId}/archive`, {});
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on workspace archive");
    return response.data;
  }

  async addResource(workspaceId: string, resourceId: string): Promise<{ status: string; workspaceId: string; resourceId: string }> {
    const response = await this.client.post<{ status: string; workspaceId: string; resourceId: string }>(
      `/workspaces/${workspaceId}/resources`,
      { resourceId }
    );
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on workspace resource add");
    return response.data;
  }

  async removeResource(workspaceId: string, resourceId: string): Promise<{ status: string; workspaceId: string; resourceId: string }> {
    const response = await this.client.delete<{ status: string; workspaceId: string; resourceId: string }>(
      `/workspaces/${workspaceId}/resources/${resourceId}`
    );
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on workspace resource remove");
    return response.data;
  }

  async shareWorkspace(workspaceId: string, userId: string): Promise<{ status: string; workspaceId: string; sharedWith: string }> {
    const response = await this.client.post<{ status: string; workspaceId: string; sharedWith: string }>(
      `/workspaces/${workspaceId}/share`,
      { userId }
    );
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on workspace share");
    return response.data;
  }

  async unshareWorkspace(workspaceId: string, userId: string): Promise<{ status: string; workspaceId: string; unsharedWith: string }> {
    const response = await this.client.post<{ status: string; workspaceId: string; unsharedWith: string }>(
      `/workspaces/${workspaceId}/unshare`,
      { userId }
    );
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on workspace unshare");
    return response.data;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createWorkspacesClient(client?: ApiClient): WorkspacesClient {
  return new ApiWorkspacesClient(client);
}
