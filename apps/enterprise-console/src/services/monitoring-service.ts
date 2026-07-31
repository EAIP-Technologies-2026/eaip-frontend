import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockMonitoringEvents } from "../mock-data/data";

export interface MonitoringEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  severity: "info" | "warning" | "error" | "critical";
  source: string;
  acknowledged: boolean;
}

export async function fetchMonitoringEvents(): Promise<ServiceResult<MonitoringEvent[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<MonitoringEvent[]>("/monitoring/events");
    if (res.error) throw res.error;
    return liveResult(res.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      const cached = createMockMonitoringEvents();
      return fallbackResult(cached.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        timestamp: item.timestamp,
        severity: item.severity,
        source: item.source,
        acknowledged: item.acknowledged,
      })), "Backend unavailable, showing cached monitoring data");
    }
    throw err;
  }
}
