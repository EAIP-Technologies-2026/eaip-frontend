import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

async function get<T>(path: string, params?: Record<string, string>): Promise<ServiceResult<T>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<T>(path, params);
    if (r.error) throw r.error;
    return liveResult(r.data as T);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null as unknown as T, "Backend unavailable");
    throw err;
  }
}
async function post<T>(
  path: string,
  body: Record<string, unknown> = {},
): Promise<ServiceResult<T>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<T>(path, body);
    if (r.error) throw r.error;
    return liveResult(r.data as T);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null as unknown as T, "Backend unavailable");
    throw err;
  }
}

export const fetchExecutionProofs = () => get<unknown[]>("/m5/audit/proofs");
export const fetchExecutionProof = (proofId: string) =>
  get<unknown>(`/m5/audit/proofs/${encodeURIComponent(proofId)}`);
export const verifyExecutionProof = (proofId: string) =>
  post<unknown>(`/m5/audit/proofs/${encodeURIComponent(proofId)}/verify`);
export const verifyAuditChain = () => post<unknown>("/m5/audit/chain/verify");
export const inspectExecution = (executionId: string) =>
  get<unknown>(`/m5/audit/executions/${encodeURIComponent(executionId)}/inspect`);
export const replayExecution = (executionId: string, safeMode = true) =>
  post<unknown>(`/m5/audit/replay/${encodeURIComponent(executionId)}`, { safe_mode: safeMode });
export const fetchVerificationReport = () => get<unknown>("/m5/audit/verification/report");
export const fetchGovernanceMetrics = () => get<unknown>("/m5/governance/metrics");
export const fetchGovernanceViolations = () => get<unknown[]>("/m5/governance/violations");
export const fetchGovernanceExceptions = () => get<unknown[]>("/m5/governance/exceptions");
