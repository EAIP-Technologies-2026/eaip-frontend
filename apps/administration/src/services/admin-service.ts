/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { getDefaultClient } from "@eaip/api";
import { createFeatureFlagClient } from "@eaip/feature-flags";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status?: string;
  lastActive?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalRoles: number;
  totalPermissions: number;
  activeSessions: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  resourceId: string;
  outcome: string;
  details?: string;
}

export interface AuditLogResponse {
  entries: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export interface License {
  id: string;
  name: string;
  type: string;
  status: string;
  seats: number;
  used: number;
}

export interface AdminSnapshot {
  services: { name: string; status: string }[];
  health: string;
  activeModules?: string[];
  activeCapabilities?: string[];
  uptimeSeconds?: number;
  timestamp: string;
}

const defaultStats: AdminStats = {
  totalUsers: 0,
  totalRoles: 0,
  totalPermissions: 0,
  activeSessions: 0,
};

const defaultSnapshot: AdminSnapshot = {
  services: [],
  health: "unknown",
  timestamp: new Date().toISOString(),
};

export async function fetchAdminStats(): Promise<ServiceResult<AdminStats>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<any>("/admin/stats");
    if (response.error) throw response.error;
    const raw = response.data || {};
    return liveResult({
      totalUsers: raw.totalUsers ?? raw.users ?? raw.userCount ?? 0,
      totalRoles: raw.totalRoles ?? raw.roles ?? raw.roleCount ?? 0,
      totalPermissions: raw.totalPermissions ?? raw.permissions ?? raw.permissionCount ?? 0,
      activeSessions: raw.activeSessions ?? raw.sessions ?? raw.activeUserCount ?? 0,
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultStats, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminUsers(options?: { search?: string; page?: number; pageSize?: number }): Promise<ServiceResult<AdminUser[]>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = {};
    if (options?.search) params.search = options.search;
    if (options?.page !== undefined) params.page = String(options.page);
    if (options?.pageSize !== undefined) params.pageSize = String(options.pageSize);

    const response = await client.get<AdminUser[]>("/admin/users", params);
    if (response.error) throw response.error;
    return liveResult(response.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function createAdminUser(name: string, email: string, roles: string[]): Promise<ServiceResult<AdminUser>> {
  try {
    const client = getDefaultClient();
    const response = await client.post<AdminUser>("/admin/users", { name, email, roles });
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on admin user creation");
    return liveResult(response.data);
  } catch (err) {
    if (isNetworkError(err)) {
      const mockUser: AdminUser = { id: `user-mock-${String(Date.now())}`, name, email, roles, status: "active" };
      return fallbackResult(mockUser, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchFeatureFlags(): Promise<ServiceResult<{ name: string; enabled: boolean }[]>> {
  try {
    const client = createFeatureFlagClient();
    const data = await client.listFlags();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function toggleFeatureFlag(name: string): Promise<ServiceResult<{ name: string; enabled: boolean }>> {
  try {
    const client = createFeatureFlagClient();
    const data = await client.toggleFlag(name);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ name, enabled: false }, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchLicenses(): Promise<ServiceResult<License[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<License[]>("/admin/licenses");
    if (response.error) throw response.error;
    return liveResult(response.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function createLicense(name: string, type: string, seats: number): Promise<ServiceResult<License>> {
  try {
    const client = getDefaultClient();
    const response = await client.post<License>("/admin/licenses", { name, type, seats });
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on license creation");
    return liveResult(response.data);
  } catch (err) {
    if (isNetworkError(err)) {
      const mockLicense: License = { id: `lic-mock-${String(Date.now())}`, name, type, status: "active", seats, used: 0 };
      return fallbackResult(mockLicense, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAuditLog(options?: { action?: string; actor?: string; resource?: string; page?: number; pageSize?: number }): Promise<ServiceResult<AuditLogResponse>> {
  const defaultLogs: AuditLogResponse = { entries: [], total: 0, page: 1, pageSize: 50 };
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = {};
    if (options?.action) params.action = options.action;
    if (options?.actor) params.actor = options.actor;
    if (options?.resource) params.resource = options.resource;
    if (options?.page !== undefined) params.page = String(options.page);
    if (options?.pageSize !== undefined) params.pageSize = String(options.pageSize);

    const response = await client.get<AuditLogResponse>("/admin/audit", params);
    if (response.error) throw response.error;
    return liveResult(response.data ?? defaultLogs);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultLogs, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchAdminSnapshot(): Promise<ServiceResult<AdminSnapshot>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<AdminSnapshot>("/admin/snapshot");
    if (response.error) throw response.error;
    if (!response.data) throw new Error("Empty response on admin snapshot");
    return liveResult(response.data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultSnapshot, "Backend unavailable");
    }
    throw err;
  }
}
