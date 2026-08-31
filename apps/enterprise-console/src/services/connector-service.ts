import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface ConnectorRecord {
  connector_id: string;
  tenant_id: string;
  connector_type: string;
  name: string;
  description: string;
  status: string;
  credential_ref: string;
  capabilities: string[];
  health_status: string;
}

export interface ConnectorCapability {
  connector_id: string;
  tenant_id: string;
  connector_type: string;
  capabilities: string[];
  operations: string[];
  permissions: string[];
  data_classes: string[];
  data_classification: string;
  cost_estimate: number;
  latency_estimate_ms: number;
  health_status: string;
  tenant_availability: boolean;
}

export interface ConnectorHealthReport {
  connector_id: string;
  tenant_id: string;
  availability: number;
  latency_ms: number;
  error_rate: number;
  auth_status: string;
  rate_limit_remaining: number;
  degradation_level: string;
  circuit_state: string;
  consecutive_failures: number;
  checked_at: string;
}

export interface PolicyCheckResult {
  decision: string;
  reason: string;
  rule_id: string;
  requires_approval: boolean;
}

export async function fetchConnectors(): Promise<ServiceResult<ConnectorRecord[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<ConnectorRecord[]>("/connectors");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchConnectorCapabilities(
  tenantId?: string,
): Promise<ServiceResult<ConnectorCapability[]>> {
  try {
    const c = getDefaultClient();
    const path = tenantId
      ? `/connectors/capabilities?tenant_id=${encodeURIComponent(tenantId)}`
      : "/connectors/capabilities";
    const r = await c.get<ConnectorCapability[]>(path);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchConnectorHealth(
  connectorId: string,
): Promise<ServiceResult<ConnectorHealthReport>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<ConnectorHealthReport>(
      `/connectors/${encodeURIComponent(connectorId)}/health`,
    );
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        connector_id: connectorId,
        tenant_id: "",
        availability: 0,
        latency_ms: 0,
        error_rate: 0,
        auth_status: "unknown",
        rate_limit_remaining: -1,
        degradation_level: "none",
        circuit_state: "closed",
        consecutive_failures: 0,
        checked_at: "",
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          connector_id: connectorId,
          tenant_id: "",
          availability: 0,
          latency_ms: 0,
          error_rate: 0,
          auth_status: "unknown",
          rate_limit_remaining: -1,
          degradation_level: "none",
          circuit_state: "closed",
          consecutive_failures: 0,
          checked_at: "",
        },
        "Backend unavailable",
      );
    throw err;
  }
}

export async function checkConnectorPolicy(body: {
  connector_id: string;
  operation: string;
  data_classification?: string;
  autonomy_level?: string;
}): Promise<ServiceResult<PolicyCheckResult>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<PolicyCheckResult>("/connectors/check-policy", body);
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        decision: "APPROVAL",
        reason: "Backend unavailable",
        rule_id: "",
        requires_approval: true,
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          decision: "APPROVAL",
          reason: "Backend unavailable",
          rule_id: "",
          requires_approval: true,
        },
        "Backend unavailable",
      );
    throw err;
  }
}

export async function invokeConnector(
  connectorId: string,
  operation: string,
  params: Record<string, unknown> = {},
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/connectors/${encodeURIComponent(connectorId)}/invoke`, {
      operation,
      params,
    });
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
