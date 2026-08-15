import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMonitoringClient, type MonitoringMetric } from "@eaip/monitoring";

export async function fetchMonitoringMetrics(): Promise<ServiceResult<MonitoringMetric[]>> {
  try {
    const client = createMonitoringClient();
    const data = await client.getMetrics();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}
