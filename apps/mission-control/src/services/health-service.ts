import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface SystemService {
  name: string;
  status: "healthy" | "degraded" | "down";
  uptime: string;
  latency: string;
  message?: string;
}

export interface SystemMetric {
  label: string;
  value: number;
  unit: string;
  threshold: number;
  status: "healthy" | "warning" | "critical";
}

export interface SystemHealthData {
  overall: "healthy" | "degraded" | "down";
  uptime: string;
  services: SystemService[];
  metrics: SystemMetric[];
}

const placeholderHealth: SystemHealthData = {
  overall: "degraded",
  uptime: "14d 6h 32m",
  services: [
    { name: "API Gateway", status: "healthy", uptime: "14d 6h 32m", latency: "12ms" },
    { name: "Database", status: "healthy", uptime: "14d 6h 32m", latency: "3ms" },
    { name: "Redis", status: "healthy", uptime: "14d 6h 30m", latency: "1ms" },
    { name: "Qdrant", status: "healthy", uptime: "14d 6h 28m", latency: "8ms" },
    { name: "MinIO", status: "degraded", uptime: "14d 5h 0m", latency: "45ms", message: "High latency observed" },
    { name: "Agent Runtime", status: "healthy", uptime: "14d 6h 32m", latency: "5ms" },
    { name: "Workflow Engine", status: "healthy", uptime: "14d 6h 31m", latency: "15ms" },
  ],
  metrics: [
    { label: "CPU", value: 62, unit: "%", threshold: 80, status: "healthy" },
    { label: "Memory", value: 74, unit: "%", threshold: 80, status: "healthy" },
    { label: "Disk", value: 55, unit: "%", threshold: 85, status: "healthy" },
    { label: "Database Connections", value: 23, unit: "/100", threshold: 80, status: "healthy" },
    { label: "Redis Cache Hit Rate", value: 94, unit: "%", threshold: 90, status: "healthy" },
    { label: "Qdrant Index Size", value: 68, unit: "GB", threshold: 100, status: "healthy" },
    { label: "MinIO Storage", value: 42, unit: "%", threshold: 80, status: "healthy" },
    { label: "API Latency P95", value: 145, unit: "ms", threshold: 200, status: "healthy" },
  ],
};

export async function fetchSystemHealth(): Promise<ServiceResult<SystemHealthData>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const [healthRes, metricsRes] = await Promise.all([
      client.get<SystemHealthData>("/system/health"),
      client.get<SystemMetric[]>("/system/metrics"),
    ]);
    if (healthRes.error) throw healthRes.error;
    if (metricsRes.error) throw metricsRes.error;
    return liveResult({
      ...placeholderHealth,
      ...healthRes.data,
      metrics: metricsRes.data ?? healthRes.data?.metrics ?? [],
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderHealth, "Backend unavailable");
    }
    throw err;
  }
}
