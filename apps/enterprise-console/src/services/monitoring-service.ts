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

interface BackendMonitoringEvent {
  id: string;
  type: string;
  action: string;
  message?: string;
  timestamp: string;
  status?: "info" | "warning" | "error" | "critical";
}

function toMonitoringEvent(e: BackendMonitoringEvent): MonitoringEvent {
  return {
    id: e.id,
    title: e.action || e.type || "Event",
    description: e.message,
    timestamp: e.timestamp,
    severity: e.status ?? "info",
    source: e.type || "System",
    acknowledged: false,
  };
}

export async function fetchMonitoringEvents(): Promise<ServiceResult<MonitoringEvent[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<BackendMonitoringEvent[]>("/monitoring/events");
    if (res.error) throw res.error;
    const items = Array.isArray(res.data) ? res.data.map(toMonitoringEvent) : [];
    return liveResult(items);
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
