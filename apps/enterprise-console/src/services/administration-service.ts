import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  department?: string;
  lastActive?: string;
  status: "active" | "inactive" | "suspended";
}

export interface AdminOrganization {
  id: string;
  name: string;
  description: string;
  status: string;
  type: string;
  memberCount: number;
  createdAt: string;
}

export interface AdminTeam {
  id: string;
  name: string;
  description: string;
  type: string;
  memberCount: number;
  parentUnitId: string | null;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissionCount: number;
  memberCount: number;
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
}

export interface AdminQuota {
  tenantId: string;
  tenantName: string;
  maxUsers: number;
  maxAgents: number;
  maxWorkflows: number;
  maxStorageGb: number;
  status: string;
}

export interface AdminIntegration {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
}

export interface AdminPolicy {
  id: string;
  name: string;
  description: string;
  effect: string;
  priority: number;
  enabled: boolean;
  ruleCount: number;
}

export interface AdminAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  resourceId: string;
  outcome: string;
  details: Record<string, unknown>;
}

export interface AdminFeatureFlag {
  name: string;
  enabled: boolean;
}

export interface AdminOverview {
  users: { total: number };
  organizations: { total: number };
  teams: { total: number };
  agents: { total: number };
  workflows: { total: number };
}

const demoUsers: AdminUser[] = [
  { id: "u1", name: "Alex Rivera", email: "alex.rivera@eaip.io", roles: ["admin"], department: "Engineering", lastActive: new Date().toISOString(), status: "active" },
  { id: "u2", name: "Sam Chen", email: "sam.chen@eaip.io", roles: ["operator", "developer"], department: "Operations", lastActive: new Date(Date.now() - 3600000).toISOString(), status: "active" },
  { id: "u3", name: "Jordan Patel", email: "jordan.patel@eaip.io", roles: ["operator"], department: "Operations", lastActive: new Date(Date.now() - 7200000).toISOString(), status: "active" },
  { id: "u4", name: "Morgan Lee", email: "morgan.lee@eaip.io", roles: ["viewer"], department: "Product", lastActive: new Date(Date.now() - 86400000).toISOString(), status: "inactive" },
  { id: "u5", name: "Casey Kim", email: "casey.kim@eaip.io", roles: ["developer"], department: "Engineering", lastActive: new Date(Date.now() - 1800000).toISOString(), status: "active" },
];

export async function fetchAdminOverview(): Promise<ServiceResult<AdminOverview>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<AdminOverview>("/administration/overview");
    if (response.error) throw response.error;
    return liveResult(response.data ?? {
      users: { total: 0 },
      organizations: { total: 0 },
      teams: { total: 0 },
      agents: { total: 0 },
      workflows: { total: 0 },
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({
        users: { total: 5 },
        organizations: { total: 1 },
        teams: { total: 3 },
        agents: { total: 0 },
        workflows: { total: 0 },
      }, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminUsers(): Promise<ServiceResult<AdminUser[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<AdminUser[]>("/admin/users");
    if (response.error) throw response.error;
    return liveResult(Array.isArray(response.data) ? response.data : []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(demoUsers, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminRoles(): Promise<ServiceResult<AdminRole[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<AdminRole[]>("/admin/roles");
    if (response.error) throw response.error;
    return liveResult(Array.isArray(response.data) ? response.data : []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminPermissions(): Promise<ServiceResult<AdminPermission[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<AdminPermission[]>("/admin/permissions");
    if (response.error) throw response.error;
    return liveResult(Array.isArray(response.data) ? response.data : []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminOrganizations(): Promise<ServiceResult<AdminOrganization[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<{ organizations: AdminOrganization[] }>("/administration/organization");
    if (response.error) throw response.error;
    return liveResult(response.data?.organizations ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminTeams(): Promise<ServiceResult<AdminTeam[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<{ teams: AdminTeam[] }>("/administration/teams");
    if (response.error) throw response.error;
    return liveResult(response.data?.teams ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminQuotas(): Promise<ServiceResult<AdminQuota[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<{ quotas: AdminQuota[] }>("/administration/quotas");
    if (response.error) throw response.error;
    return liveResult(response.data?.quotas ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminIntegrations(): Promise<ServiceResult<AdminIntegration[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<{ integrations: AdminIntegration[] }>("/administration/integrations");
    if (response.error) throw response.error;
    return liveResult(response.data?.integrations ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminPolicies(): Promise<ServiceResult<AdminPolicy[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<{ policies: AdminPolicy[] }>("/administration/policies");
    if (response.error) throw response.error;
    return liveResult(response.data?.policies ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminAudit(options?: {
  action?: string;
  actor?: string;
  resource?: string;
  page?: number;
  pageSize?: number;
}): Promise<ServiceResult<{ entries: AdminAuditEntry[]; total: number }>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = {};
    if (options?.action) params.action = options.action;
    if (options?.actor) params.actor = options.actor;
    if (options?.resource) params.resource = options.resource;
    if (options?.page) params.page = String(options.page);
    if (options?.pageSize) params.pageSize = String(options.pageSize);
    const response = await client.get<{ entries: AdminAuditEntry[]; total: number }>("/administration/audit", params);
    if (response.error) throw response.error;
    return liveResult(response.data ?? { entries: [], total: 0 });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ entries: [], total: 0 }, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminFeatureFlags(): Promise<ServiceResult<AdminFeatureFlag[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<{ flags: AdminFeatureFlag[] }>("/administration/feature-flags");
    if (response.error) throw response.error;
    return liveResult(response.data?.flags ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function toggleAdminFeatureFlag(flagName: string): Promise<ServiceResult<AdminFeatureFlag>> {
  try {
    const client = getDefaultClient();
    const response = await client.post<AdminFeatureFlag>(`/administration/feature-flags/${flagName}/toggle`, {});
    if (response.error) throw response.error;
    return liveResult(response.data ?? { name: flagName, enabled: false });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ name: flagName, enabled: false }, "Backend unavailable");
    }
    throw err;
  }
}
