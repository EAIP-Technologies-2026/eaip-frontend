import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend organizations.py
// ---------------------------------------------------------------------------

export interface Organization {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  [key: string]: unknown;
}

export interface OrganizationsClient {
  listOrganizations(): Promise<Organization[]>;
  createOrganization(org: { name: string; slug?: string }): Promise<Organization>;
  getOrganization(orgId: string): Promise<Organization>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ApiOrganizationsClient implements OrganizationsClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listOrganizations(): Promise<Organization[]> {
    const response = await this.client.get<Organization[]>("/organizations");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async createOrganization(org: { name: string; slug?: string }): Promise<Organization> {
    const response = await this.client.post<Organization>("/organizations", org);
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on organization creation");
    return response.data;
  }

  async getOrganization(orgId: string): Promise<Organization> {
    const response = await this.client.get<Organization>(`/organizations/${orgId}`);
    if (response.error) throw response.error;
    if (!response.data) throw new Error(`Organization ${orgId} not found`);
    return response.data;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createOrganizationsClient(client?: ApiClient): OrganizationsClient {
  return new ApiOrganizationsClient(client);
}
