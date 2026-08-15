import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import {
  createMonitoringClient,
  type MonitoringHealth,
  type MonitoringMetric,
  type MonitoringLog,
  type MonitoringAlert,
  type MonitoringQueue,
  type MonitoringDiagnostics,
  type MonitoringEvent,
} from "@eaip/monitoring";

export async function fetchMonitoringHealth(): Promise<ServiceResult<MonitoringHealth[]>> {
  try {
    const client = createMonitoringClient();
    const data = await client.getHealth();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

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

export async function fetchMonitoringLogs(options?: { limit?: number; level?: string; source?: string }): Promise<ServiceResult<MonitoringLog[]>> {
  try {
    const client = createMonitoringClient();
    const data = await client.getLogs(options);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchMonitoringAlerts(): Promise<ServiceResult<MonitoringAlert[]>> {
  try {
    const client = createMonitoringClient();
    const data = await client.getAlerts();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchMonitoringQueues(): Promise<ServiceResult<MonitoringQueue[]>> {
  try {
    const client = createMonitoringClient();
    const data = await client.getQueues();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchMonitoringDiagnostics(): Promise<ServiceResult<MonitoringDiagnostics>> {
  const fallbackDiag: MonitoringDiagnostics = { checks: [], lastRun: new Date().toISOString(), passed: 0, failed: 0 };
  try {
    const client = createMonitoringClient();
    const data = await client.getDiagnostics();
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(fallbackDiag, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchMonitoringEvents(options?: { limit?: number }): Promise<ServiceResult<MonitoringEvent[]>> {
  try {
    const client = createMonitoringClient();
    const data = await client.getEvents(options);
    return liveResult(data);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}
