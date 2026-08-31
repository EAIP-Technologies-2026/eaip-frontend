import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface Runtime {
  runtime_id: string;
  kind: string;
  name: string;
  status: string;
  capabilities: string[];
}

export async function fetchRuntimes(): Promise<ServiceResult<Runtime[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<Runtime[]>("/runtimes");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function fetchAuditChain(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/audit-chain");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function verifyAuditChain(): Promise<
  ServiceResult<{ valid: boolean; count: number }>
> {
  try {
    const c = getDefaultClient();
    const r = await c.get<{ valid: boolean; count: number }>("/audit-chain/verify");
    if (r.error) throw r.error;
    return liveResult(r.data ?? { valid: true, count: 0 });
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult({ valid: true, count: 0 }, "Backend unavailable");
    throw err;
  }
}
export async function fetchFederatedOrgs(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/federation/orgs");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
