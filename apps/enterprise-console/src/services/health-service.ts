import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockSystemHealth } from "../mock-data/data";

export interface HealthService {
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: string;
  latency: string;
  message?: string;
}

export interface HealthMetric {
  label: string;
  value: number;
  unit: string;
  threshold: number;
  status: "healthy" | "warning" | "critical";
}

export interface SystemHealth {
  overall: "healthy" | "degraded" | "down";
  uptime: string;
  services: HealthService[];
  metrics: HealthMetric[];
}

export async function fetchSystemHealth(): Promise<ServiceResult<SystemHealth>> {
  try {
    const client = getDefaultClient();
    const [healthRes, metricsRes] = await Promise.all([
      client.get<SystemHealth>("/system/health"),
      client.get<HealthMetric[]>("/system/metrics"),
    ]);
    if (healthRes.error) throw healthRes.error;
    if (metricsRes.error) throw metricsRes.error;
    const metrics = metricsRes.data ?? [];
    return liveResult({ ...(healthRes.data ?? { overall: "healthy", uptime: "", services: [], metrics }), metrics });
  } catch (err) {
    if (isNetworkError(err)) {
      const cached = createMockSystemHealth();
      return fallbackResult(cached, "Backend unavailable, showing cached health data");
    }
    throw err;
  }
}
