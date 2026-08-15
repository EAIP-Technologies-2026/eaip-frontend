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
    const { createMonitoringClient } = await import("@eaip/monitoring");
    const { createRuntimeClient } = await import("@eaip/runtime");

    const monitoringClient = createMonitoringClient();
    const runtimeClient = createRuntimeClient();

    const [healthList, rawMetrics, runtimeMetrics] = await Promise.all([
      monitoringClient.getHealth(),
      monitoringClient.getMetrics(),
      runtimeClient.getMetrics(),
    ]);

    const services: SystemService[] = healthList.map((svc) => ({
      name: svc.name,
      status: mapStatus(svc.status),
      uptime: svc.uptime || "0s",
      latency: svc.responseTime ? `${String(svc.responseTime)}ms` : "N/A",
    }));

    const metrics: SystemMetric[] = rawMetrics.map((met) => {
      const val = parseFloat(met.value) || 0;
      return {
        label: met.label,
        value: val,
        unit: met.unit || "",
        threshold: 80,
        status: val > 80 ? "critical" : val > 60 ? "warning" : "healthy",
      };
    });

    const overall = services.some((s) => s.status === "down")
      ? "down"
      : services.some((s) => s.status === "degraded")
      ? "degraded"
      : "healthy";

    return liveResult({
      overall,
      uptime: runtimeMetrics.uptime || "0s",
      services,
      metrics,
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderHealth, "Backend unavailable");
    }
    throw err;
  }
}

function mapStatus(status: string): SystemService["status"] {
  const s = status.toLowerCase();
  if (s === "healthy" || s === "passed" || s === "ok" || s === "active") return "healthy";
  if (s === "degraded" || s === "warning") return "degraded";
  return "down";
}
