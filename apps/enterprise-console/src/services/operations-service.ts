import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface OperationsOverview {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  successRate: number;
  activeOperations: number;
  uptime: string;
  uptimeSeconds: number;
  overallStatus: string;
}

export interface AgentAnalytics {
  total: number;
  running: number;
  idle: number;
  error: number;
  paused: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  avgLatencyMs: number;
  executionsToday: number;
}

export interface WorkflowAnalytics {
  total: number;
  active: number;
  paused: number;
  draft: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  avgDurationMs: number;
  executionsToday: number;
}

export interface HealthAnalytics {
  overall: string;
  totalServices: number;
  healthy: number;
  degraded: number;
  down: number;
}

export interface OperationsEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
}

export interface OperationsAnalyticsData {
  overview: OperationsOverview;
  agents: AgentAnalytics;
  workflows: WorkflowAnalytics;
  health: HealthAnalytics;
  events: {
    total: number;
    recent: OperationsEvent[];
  };
}

export interface OperationsFailure {
  id: string;
  title: string;
  message: string;
  severity: string;
  source: string;
  timestamp: string;
  type: string;
}

export interface HealthService {
  name: string;
  status: string;
  message: string;
}

export interface OperationsHealthData {
  overall: string;
  services: HealthService[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
  };
}

const defaultAnalytics: OperationsAnalyticsData = {
  overview: {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    successRate: 0,
    activeOperations: 0,
    uptime: "0s",
    uptimeSeconds: 0,
    overallStatus: "healthy",
  },
  agents: {
    total: 0,
    running: 0,
    idle: 0,
    error: 0,
    paused: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    successRate: 0,
    avgLatencyMs: 0,
    executionsToday: 0,
  },
  workflows: {
    total: 0,
    active: 0,
    paused: 0,
    draft: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    successRate: 0,
    avgDurationMs: 0,
    executionsToday: 0,
  },
  health: {
    overall: "healthy",
    totalServices: 0,
    healthy: 0,
    degraded: 0,
    down: 0,
  },
  events: {
    total: 0,
    recent: [],
  },
};

export async function fetchOperationsAnalytics(): Promise<ServiceResult<OperationsAnalyticsData>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<OperationsAnalyticsData>("/operations/analytics");
    if (res.error) throw res.error;
    return liveResult(res.data ?? defaultAnalytics);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(defaultAnalytics, "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchOperationsFailures(): Promise<ServiceResult<OperationsFailure[]>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<{ failures: OperationsFailure[] }>("/operations/failures");
    if (res.error) throw res.error;
    return liveResult(res.data?.failures ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult([], "Backend unavailable");
    }
    throw err;
  }
}

export async function fetchOperationsHealth(): Promise<ServiceResult<OperationsHealthData>> {
  try {
    const client = getDefaultClient();
    const res = await client.get<OperationsHealthData>("/operations/health");
    if (res.error) throw res.error;
    return liveResult(res.data ?? {
      overall: "healthy",
      services: [],
      summary: { total: 0, healthy: 0, degraded: 0, down: 0 },
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult({
        overall: "healthy",
        services: [],
        summary: { total: 0, healthy: 0, degraded: 0, down: 0 },
      }, "Backend unavailable");
    }
    throw err;
  }
}
