import { getDefaultClient, type ApiClient } from "@eaip/api";

// ---------------------------------------------------------------------------
// Types — derived from backend monitoring_routes.py
// ---------------------------------------------------------------------------

export interface MonitoringHealth {
  name: string;
  status: string;
  uptime: string;
  responseTime: number;
  version: string;
}

export interface MonitoringMetric {
  label: string;
  value: string;
  unit: string;
  change: number;
  trend: string;
}

export interface MonitoringLog {
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

export interface MonitoringAlert {
  id: string;
  severity: string;
  message: string;
  timestamp: string;
  source: string;
}

export interface MonitoringQueue {
  name: string;
  size: number;
  activeWorkers: number;
  processedCount: number;
  failedCount: number;
}

export interface DiagnosticsCheck {
  name: string;
  status: string;
  message: string;
  duration: number;
}

export interface MonitoringDiagnostics {
  checks: DiagnosticsCheck[];
  lastRun: string;
  passed: number;
  failed: number;
}

export interface MonitoringEvent {
  id: string;
  eventType: string;
  eventSource: string;
  payload: unknown;
  timestamp: string;
}

export interface MonitoringClient {
  getHealth(): Promise<MonitoringHealth[]>;
  getMetrics(): Promise<MonitoringMetric[]>;
  getLogs(options?: { limit?: number; level?: string; source?: string }): Promise<MonitoringLog[]>;
  getAlerts(): Promise<MonitoringAlert[]>;
  getQueues(): Promise<MonitoringQueue[]>;
  getDiagnostics(): Promise<MonitoringDiagnostics>;
  getEvents(options?: { limit?: number }): Promise<MonitoringEvent[]>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class ApiMonitoringClient implements MonitoringClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async getHealth(): Promise<MonitoringHealth[]> {
    const response = await this.client.get<MonitoringHealth[]>("/monitoring/health");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getMetrics(): Promise<MonitoringMetric[]> {
    const response = await this.client.get<MonitoringMetric[]>("/monitoring/metrics");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getLogs(options?: { limit?: number; level?: string; source?: string }): Promise<MonitoringLog[]> {
    const params: Record<string, string> = {};
    if (options?.limit !== undefined) params.limit = String(options.limit);
    if (options?.level) params.level = options.level;
    if (options?.source) params.source = options.source;

    const response = await this.client.get<MonitoringLog[]>("/monitoring/logs", params);
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getAlerts(): Promise<MonitoringAlert[]> {
    const response = await this.client.get<MonitoringAlert[]>("/monitoring/alerts");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getQueues(): Promise<MonitoringQueue[]> {
    const response = await this.client.get<MonitoringQueue[]>("/monitoring/queues");
    if (response.error) throw response.error;
    return response.data ?? [];
  }

  async getDiagnostics(): Promise<MonitoringDiagnostics> {
    const response = await this.client.get<MonitoringDiagnostics>("/monitoring/diagnostics");
    if (response.error) throw response.error;
    if (!response.data) {
      throw new Error("Diagnostics response is empty");
    }
    return response.data;
  }

  async getEvents(options?: { limit?: number }): Promise<MonitoringEvent[]> {
    const params: Record<string, string> = {};
    if (options?.limit !== undefined) params.limit = String(options.limit);

    const asString = (value: unknown, fallback: string): string =>
      typeof value === "string" && value.length > 0 ? value : fallback;

    const response = await this.client.get<unknown>("/monitoring/events", params);
    if (response.error) throw response.error;
    const raw = Array.isArray(response.data) ? response.data : [];
    return raw.map((item, idx) => {
      const obj = (item ?? {}) as Record<string, unknown>;
      if (obj.eventType !== undefined) {
        return {
          id: asString(obj.id, `evt-${String(idx)}`),
          eventType: asString(obj.eventType, "system_event"),
          eventSource: asString(obj.eventSource, "system"),
          payload: obj.payload,
          timestamp: asString(obj.timestamp, new Date().toISOString()),
        };
      }
      // Backend flat event shape: { id, type, action, message, timestamp, status }
      return {
        id: asString(obj.id, `evt-${String(idx)}`),
        eventType: asString(obj.type, asString(obj.action, "system_event")),
        eventSource: asString(obj.type, asString(obj.source, "system")),
        payload: {
          type: obj.type,
          action: obj.action,
          message: obj.message,
          severity: obj.status ?? "info",
        },
        timestamp: asString(obj.timestamp, new Date().toISOString()),
      };
    });
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createMonitoringClient(client?: ApiClient): MonitoringClient {
  return new ApiMonitoringClient(client);
}
