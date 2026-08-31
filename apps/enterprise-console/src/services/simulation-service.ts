import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface SimulationEvent {
  id: string;
  tenant_id: string;
  enterprise: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface EnterpriseState {
  enterprise: string;
  workload: number;
  utilization: number;
  active_tasks: number;
  alerts: number;
}

export interface SimulationTickResult {
  tick_count: number;
  events: SimulationEvent[];
}

export async function fetchSimulationEvents(
  enterprise?: string,
  limit?: number,
): Promise<ServiceResult<SimulationEvent[]>> {
  try {
    const client = getDefaultClient();
    const params: Record<string, string> = {};
    if (enterprise) params.enterprise = enterprise;
    if (limit) params.limit = String(limit);
    const res = await client.get<SimulationEvent[]>("/simulation/events", params);
    if (res.error) throw res.error;
    return liveResult(res.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function triggerSimulationTick(): Promise<ServiceResult<SimulationTickResult>> {
  try {
    const client = getDefaultClient();
    const res = await client.post<SimulationTickResult>("/simulation/tick", {});
    if (res.error) throw res.error;
    return liveResult(res.data ?? { tick_count: 0, events: [] });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({ tick_count: 0, events: [] }, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchEnterpriseState(
  enterprise: string,
): Promise<ServiceResult<EnterpriseState>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<EnterpriseState>(
      `/simulation/state/${encodeURIComponent(enterprise)}`,
    );
    if (res.error) throw res.error;
    return liveResult(
      res.data ?? { enterprise, workload: 0, utilization: 0, active_tasks: 0, alerts: 0 },
    );
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        { enterprise, workload: 0, utilization: 0, active_tasks: 0, alerts: 0 },
        "Backend unavailable",
      );
    }
    throw err;
  }
}

export async function fetchAllStates(): Promise<ServiceResult<EnterpriseState[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<EnterpriseState[]>("/simulation/state");
    if (res.error) throw res.error;
    return liveResult(res.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function generateSimulationEvent(
  enterprise: string,
  event_type: string,
): Promise<ServiceResult<SimulationEvent>> {
  try {
    const client = getDefaultClient();
    const res = await client.post<SimulationEvent>("/simulation/generate", {
      enterprise,
      event_type,
    });
    if (res.error) throw res.error;
    if (!res.data) throw new Error("No data returned");
    return liveResult(res.data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        {
          id: "",
          tenant_id: "",
          enterprise,
          event_type,
          payload: {},
          created_at: new Date().toISOString(),
        },
        "Backend unavailable",
      );
    }
    throw err;
  }
}
