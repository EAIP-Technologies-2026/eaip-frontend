import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface OnboardingSession {
  session_id: string;
  tenant_id: string;
  company_name: string;
  industry: string;
  pack_id: string;
  status: string;
  progress: number;
  current_step: string;
  steps: string[];
}

export async function createOnboardingSession(
  body: Record<string, unknown>,
): Promise<ServiceResult<OnboardingSession>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<OnboardingSession>("/onboarding/sessions", body);
    if (r.error) throw r.error;
    if (!r.data) throw new Error("no data");
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err))
      return fallbackResult(
        {
          session_id: "",
          tenant_id: "",
          company_name: "",
          industry: "",
          pack_id: "",
          status: "pending",
          progress: 0,
          current_step: "",
          steps: [],
        },
        "Backend unavailable",
      );
    throw err;
  }
}

export async function fetchOnboardingSessions(): Promise<ServiceResult<OnboardingSession[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<OnboardingSession[]>("/onboarding/sessions");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

export async function fetchOnboardingSession(
  sessionId: string,
): Promise<ServiceResult<OnboardingSession | null>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<OnboardingSession>(
      `/onboarding/sessions/${encodeURIComponent(sessionId)}`,
    );
    if (r.error) throw r.error;
    return liveResult(r.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}

export async function advanceOnboardingSession(
  sessionId: string,
  body: Record<string, unknown> = {},
): Promise<ServiceResult<OnboardingSession | null>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<OnboardingSession>(
      `/onboarding/sessions/${encodeURIComponent(sessionId)}/advance`,
      body,
    );
    if (r.error) throw r.error;
    return liveResult(r.data ?? null);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
