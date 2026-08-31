import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export async function fetchCapabilities(q?: string): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/intelligence/kernel/capabilities", q ? { q } : undefined);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function fetchKernelHealth(): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get("/intelligence/kernel/health");
    if (r.error) throw r.error;
    return liveResult(r.data ?? {});
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
export async function executeCapability(
  capabilityId: string,
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/intelligence/kernel/executions", {
      capability_id: capabilityId,
      ...body,
    });
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function fetchSupervision(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/intelligence/supervision");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function fetchCognitionContext(): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get("/intelligence/cognition/context");
    if (r.error) throw r.error;
    return liveResult(r.data ?? {});
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
export async function fetchDecisions(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/intelligence/decisions");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function fetchCoordinationPlans(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/intelligence/coordination/plans");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
