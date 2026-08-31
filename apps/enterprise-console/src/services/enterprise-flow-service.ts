import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface FlowStep {
  step: string;
  status: string;
  count?: number;
  recommendations?: number;
  candidates?: number;
  schedule_id?: string;
  entity_id?: string;
  overview?: unknown;
  reason?: string;
  error?: string;
}

export interface EnterpriseFlowResult {
  correlation_id: string;
  enterprise: string;
  tenant_id: string;
  steps: FlowStep[];
  status: string;
}

export async function triggerEnterpriseFlow(
  enterprise: string,
  body?: Record<string, unknown>,
): Promise<ServiceResult<EnterpriseFlowResult>> {
  try {
    const client = getDefaultClient();
    const res = await client.post<EnterpriseFlowResult>(
      `/enterprise/flows/${encodeURIComponent(enterprise)}/trigger`,
      body ?? {},
    );
    if (res.error) throw res.error;
    if (!res.data) throw new Error("No data returned");
    return liveResult(res.data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        {
          correlation_id: "",
          enterprise,
          tenant_id: "",
          steps: [],
          status: "failed",
        },
        "Backend unavailable",
      );
    }
    throw err;
  }
}
