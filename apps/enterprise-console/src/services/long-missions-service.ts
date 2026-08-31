import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface LongMission {
  mission_id: string;
  tenant_id: string;
  name: string;
  status: string;
  current_step: number;
  autonomy_level: string;
}

export async function fetchLongMissions(): Promise<ServiceResult<LongMission[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<LongMission[]>("/long-missions");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function createLongMission(
  body: Record<string, unknown>,
): Promise<ServiceResult<LongMission>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<LongMission>("/long-missions", body);
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        mission_id: "",
        tenant_id: "",
        name: "",
        status: "pending",
        current_step: 0,
        autonomy_level: "SUGGEST",
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          mission_id: "",
          tenant_id: "",
          name: "",
          status: "pending",
          current_step: 0,
          autonomy_level: "SUGGEST",
        },
        "Backend unavailable",
      );
    throw err;
  }
}
export async function pauseLongMission(id: string): Promise<ServiceResult<LongMission>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<LongMission>(`/long-missions/${encodeURIComponent(id)}/pause`, {});
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        mission_id: id,
        tenant_id: "",
        name: "",
        status: "paused",
        current_step: 0,
        autonomy_level: "SUGGEST",
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          mission_id: id,
          tenant_id: "",
          name: "",
          status: "paused",
          current_step: 0,
          autonomy_level: "SUGGEST",
        },
        "Backend unavailable",
      );
    throw err;
  }
}
export async function resumeLongMission(id: string): Promise<ServiceResult<LongMission>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<LongMission>(`/long-missions/${encodeURIComponent(id)}/resume`, {});
    if (r.error) throw r.error;
    return liveResult(
      r.data ?? {
        mission_id: id,
        tenant_id: "",
        name: "",
        status: "running",
        current_step: 0,
        autonomy_level: "SUGGEST",
      },
    );
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          mission_id: id,
          tenant_id: "",
          name: "",
          status: "running",
          current_step: 0,
          autonomy_level: "SUGGEST",
        },
        "Backend unavailable",
      );
    throw err;
  }
}
export async function checkpointLongMission(
  id: string,
  state: Record<string, unknown> = {},
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/long-missions/${encodeURIComponent(id)}/checkpoint`, state);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
