/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface QueueItem {
  id: string;
  type: "agent" | "workflow" | "task";
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  priority: "low" | "normal" | "high" | "critical";
  enqueuedAt: string;
  startedAt?: string;
  duration?: number;
  retryCount: number;
}

const placeholderQueue: QueueItem[] = [
  { id: "q-1", type: "workflow", name: "Q3 Report Generation", status: "running", priority: "high", enqueuedAt: new Date(Date.now() - 60000).toISOString(), startedAt: new Date(Date.now() - 30000).toISOString(), retryCount: 0 },
  { id: "q-2", type: "agent", name: "Data Pipeline Execution", status: "running", priority: "critical", enqueuedAt: new Date(Date.now() - 120000).toISOString(), startedAt: new Date(Date.now() - 90000).toISOString(), retryCount: 1 },
  { id: "q-3", type: "task", name: "Knowledge Index Update", status: "pending", priority: "normal", enqueuedAt: new Date(Date.now() - 180000).toISOString(), retryCount: 0 },
  { id: "q-4", type: "agent", name: "Alert Response Handler", status: "pending", priority: "high", enqueuedAt: new Date(Date.now() - 240000).toISOString(), retryCount: 0 },
  { id: "q-5", type: "workflow", name: "Weekly Report", status: "completed", priority: "normal", enqueuedAt: new Date(Date.now() - 3600000).toISOString(), startedAt: new Date(Date.now() - 3500000).toISOString(), duration: 120000, retryCount: 0 },
  { id: "q-6", type: "agent", name: "Search Index Rebuild", status: "failed", priority: "low", enqueuedAt: new Date(Date.now() - 7200000).toISOString(), startedAt: new Date(Date.now() - 7100000).toISOString(), duration: 300000, retryCount: 3 },
];

export async function fetchQueue(): Promise<ServiceResult<QueueItem[]>> {
  try {
    const { createMonitoringClient } = await import("@eaip/monitoring");
    const client = createMonitoringClient();
    const data = await client.getQueues();
    const raw = Array.isArray(data) ? (data as any[]) : [];
    const items: QueueItem[] = raw.map((item, idx) => ({
      id: (item.id as string | undefined) ?? `q-${String(idx)}`,
      type: (item.type as QueueItem["type"] | undefined) ?? "task",
      name: (item.name as string | undefined) ?? "Task",
      status: (item.status as QueueItem["status"] | undefined) ?? "pending",
      priority: (item.priority as QueueItem["priority"] | undefined) ?? "normal",
      enqueuedAt: (item.enqueuedAt as string | undefined) ?? new Date().toISOString(),
      retryCount: typeof item.retryCount === "number" ? item.retryCount : 0,
    }));
    return liveResult(items.length > 0 ? items : placeholderQueue);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderQueue, "Backend unavailable");
    }
    throw err;
  }
}
