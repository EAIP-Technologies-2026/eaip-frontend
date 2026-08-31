import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface SolutionPack {
  pack_id: string;
  industry: string;
  name: string;
  description: string;
  version: string;
  agents: unknown[];
  workflows: unknown[];
  missions: unknown[];
  kpis: unknown[];
  status: string;
}

export async function fetchSolutionPacks(): Promise<ServiceResult<SolutionPack[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<SolutionPack[]>("/solution-packs");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchSolutionPack(
  packId: string,
): Promise<ServiceResult<SolutionPack | null>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<SolutionPack>(`/solution-packs/${encodeURIComponent(packId)}`);
    if (r.error) throw r.error;
    return liveResult(r.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}

export async function installSolutionPack(
  packId: string,
  config: Record<string, unknown> = {},
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/solution-packs/${encodeURIComponent(packId)}/install`, config);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}

export async function fetchPackInstallations(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/solution-packs/installations/list");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
