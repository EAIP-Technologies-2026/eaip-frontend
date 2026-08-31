import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface IntegrationServer {
  server_id: string;
  tenant_id: string;
  name: string;
  transport_type: string;
  endpoint: string;
  status: string;
  capabilities: string[];
  version: string;
}

export interface IntegrationTool {
  name: string;
  description: string;
  server_id: string;
  availability: boolean;
}

export async function fetchIntegrationServers(): Promise<ServiceResult<IntegrationServer[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<IntegrationServer[]>("/integrations/servers");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function createIntegrationServer(
  body: Record<string, unknown>,
): Promise<ServiceResult<IntegrationServer>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<IntegrationServer>("/integrations/servers", body);
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        server_id: "",
        tenant_id: "",
        name: "",
        transport_type: "stdio",
        endpoint: "",
        status: "draft",
        capabilities: [],
        version: "1.0.0",
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          server_id: "",
          tenant_id: "",
          name: "",
          transport_type: "stdio",
          endpoint: "",
          status: "draft",
          capabilities: [],
          version: "1.0.0",
        },
        "Backend unavailable",
      );
    throw err;
  }
}

export async function deleteIntegrationServer(serverId: string): Promise<ServiceResult<void>> {
  try {
    const c = getDefaultClient();
    const r = await c.delete<null>(`/integrations/servers/${encodeURIComponent(serverId)}`);
    if (r.error) throw r.error;
    return liveResult(undefined);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(undefined, "Backend unavailable");
    throw err;
  }
}

export async function connectIntegrationServer(serverId: string): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/integrations/servers/${encodeURIComponent(serverId)}/connect`, {});
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}

export async function disconnectIntegrationServer(
  serverId: string,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/integrations/servers/${encodeURIComponent(serverId)}/disconnect`, {});
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}

export async function fetchIntegrationTools(
  serverId?: string,
): Promise<ServiceResult<IntegrationTool[]>> {
  try {
    const c = getDefaultClient();
    const path = serverId
      ? `/integrations/servers/${encodeURIComponent(serverId)}/tools`
      : "/integrations/tools";
    const r = await c.get<IntegrationTool[]>(path);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function invokeIntegrationTool(
  serverId: string,
  toolName: string,
  args: Record<string, unknown> = {},
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(
      `/integrations/servers/${encodeURIComponent(serverId)}/tools/${encodeURIComponent(toolName)}/invoke`,
      args,
    );
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
