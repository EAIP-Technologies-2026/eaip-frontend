import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface Swarm {
  swarm_id: string;
  tenant_id: string;
  name: string;
  pattern: string;
  autonomy_level: string;
  status: string;
  tasks: unknown[];
}
export interface SwarmExecution {
  execution_id: string;
  swarm_id: string;
  tenant_id: string;
  status: string;
  aggregated_result: string;
}

export async function fetchSwarms(): Promise<ServiceResult<Swarm[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<Swarm[]>("/swarms");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function createSwarm(body: Record<string, unknown>): Promise<ServiceResult<Swarm>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<Swarm>("/swarms", body);
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        swarm_id: "",
        tenant_id: "",
        name: "",
        pattern: "parallel",
        autonomy_level: "SUGGEST",
        status: "pending",
        tasks: [],
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          swarm_id: "",
          tenant_id: "",
          name: "",
          pattern: "parallel",
          autonomy_level: "SUGGEST",
          status: "pending",
          tasks: [],
        },
        "Backend unavailable",
      );
    throw err;
  }
}
export async function executeSwarm(
  swarmId: string,
  body: Record<string, unknown> = {},
): Promise<ServiceResult<SwarmExecution>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<SwarmExecution>(`/swarms/${encodeURIComponent(swarmId)}/execute`, body);
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        execution_id: "",
        swarm_id: swarmId,
        tenant_id: "",
        status: "failed",
        aggregated_result: "",
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          execution_id: "",
          swarm_id: swarmId,
          tenant_id: "",
          status: "failed",
          aggregated_result: "",
        },
        "Backend unavailable",
      );
    throw err;
  }
}
export async function fetchSwarmExecutions(): Promise<ServiceResult<SwarmExecution[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<SwarmExecution[]>("/swarms/executions/list");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
