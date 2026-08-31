import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export async function fetchStrategicObjectives(status?: string): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/m4/objectives", status ? { status } : undefined);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchStrategicObjective(
  objectiveId: string,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get(`/m4/objectives/${objectiveId}`);
    if (r.error) throw r.error;
    return liveResult(r.data ?? {});
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}

export async function fetchStrategicInitiatives(
  objectiveId?: string,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>(
      "/m4/initiatives",
      objectiveId ? { objective_id: objectiveId } : undefined,
    );
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchStrategicConstraints(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/m4/constraints");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchStrategicThemes(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/m4/themes");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchStrategicState(): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get("/m4/state/current");
    if (r.error) throw r.error;
    return liveResult(r.data ?? {});
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}

export async function fetchStrategicStateHistory(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/m4/state/history");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchStrategicRisks(objectiveId?: string): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>(
      "/m4/risks",
      objectiveId ? { objective_id: objectiveId } : undefined,
    );
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchStrategicKPIs(objectiveId?: string): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>(
      "/m4/kpis",
      objectiveId ? { objective_id: objectiveId } : undefined,
    );
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchStrategyGraph(): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get("/m4/graph");
    if (r.error) throw r.error;
    return liveResult(r.data ?? {});
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}

export async function traceObjectiveToOutcomes(
  objectiveId: string,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>(`/m4/graph/trace/${objectiveId}`);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchIntelligenceCycles(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/m4/cycles");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function replayIntelligenceCycle(cycleId: string): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get(`/m4/cycles/${cycleId}/replay`);
    if (r.error) throw r.error;
    return liveResult(r.data ?? {});
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}

export async function fetchGovernanceDecisions(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/m4/governance/decisions");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchGovernancePolicies(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/m4/governance/policies");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function assembleKCRContext(
  query: string,
  contextType?: string,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/knowledge/kcr/assemble", {
      query,
      context_type: contextType ?? "full",
    });
    if (r.error) throw r.error;
    return liveResult(r.data ?? {});
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
