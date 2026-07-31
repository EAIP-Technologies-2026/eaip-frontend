import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface TimelineEvent {
  id: string;
  type: "agent_started" | "workflow_started" | "knowledge_updated" | "alert" | "failure" | "recovery" | "system_event";
  title: string;
  description?: string;
  timestamp: string;
  source: string;
  severity: "info" | "warning" | "error" | "critical";
}

const placeholderEvents: TimelineEvent[] = [
  { id: "evt-1", type: "agent_started", title: "Data Analyzer started", timestamp: new Date(Date.now() - 30000).toISOString(), source: "agent-1", severity: "info" },
  { id: "evt-2", type: "workflow_started", title: "Q3 Report workflow started", description: "Workflow wf-42 started execution", timestamp: new Date(Date.now() - 120000).toISOString(), source: "workflow", severity: "info" },
  { id: "evt-3", type: "knowledge_updated", title: "Knowledge base updated", description: "12 new documents indexed", timestamp: new Date(Date.now() - 300000).toISOString(), source: "knowledge", severity: "info" },
  { id: "evt-4", type: "alert", title: "High memory usage on Monitoring Agent", description: "Memory at 91%", timestamp: new Date(Date.now() - 600000).toISOString(), source: "agent-3", severity: "warning" },
  { id: "evt-5", type: "failure", title: "Search Indexer unresponsive", description: "Agent failed to respond to health check", timestamp: new Date(Date.now() - 900000).toISOString(), source: "agent-4", severity: "error" },
  { id: "evt-6", type: "recovery", title: "Code Reviewer recovered", description: "Agent back online after restart", timestamp: new Date(Date.now() - 1800000).toISOString(), source: "agent-2", severity: "info" },
  { id: "evt-7", type: "system_event", title: "System maintenance completed", description: "Scheduled maintenance finished successfully", timestamp: new Date(Date.now() - 3600000).toISOString(), source: "system", severity: "info" },
  { id: "evt-8", type: "alert", title: "Critical: Pipeline failure", description: "Data pipeline crashed with OOM error", timestamp: new Date(Date.now() - 7200000).toISOString(), source: "agent-8", severity: "critical" },
];

export async function fetchEvents(): Promise<ServiceResult<TimelineEvent[]>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const res = await client.get<unknown[]>("/monitoring/events");
    if (res.error) throw res.error;
    const raw = Array.isArray(res.data) ? res.data as Record<string, unknown>[] : [];
    const events: TimelineEvent[] = raw.map((item, idx) => ({
      id: (item.id as string | undefined) ?? `evt-${String(idx)}`,
      type: mapEventType((item.type as string | undefined) ?? (item.severity as string | undefined) ?? (item.status as string | undefined) ?? "system_event"),
      title: (item.title as string | undefined) ?? (item.message as string | undefined) ?? "Event",
      description: item.description as string | undefined,
      timestamp: (item.timestamp as string | undefined) ?? new Date().toISOString(),
      source: (item.source as string | undefined) ?? "system",
      severity: (item.severity as TimelineEvent["severity"] | undefined) ?? "info",
    }));
    return liveResult(events);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderEvents, "Backend unavailable");
    }
    throw err;
  }
}

function mapEventType(raw: string): TimelineEvent["type"] {
  const lc = raw.toLowerCase();
  if (lc.includes("agent") && (lc.includes("start") || lc.includes("created"))) return "agent_started";
  if (lc.includes("workflow") && (lc.includes("start") || lc.includes("created"))) return "workflow_started";
  if (lc.includes("knowledge") || lc.includes("index")) return "knowledge_updated";
  if (lc.includes("alert")) return "alert";
  if (lc.includes("fail") || lc.includes("error") || lc.includes("critical")) return "failure";
  if (lc.includes("recov") || lc.includes("restor") || lc.includes("resolv")) return "recovery";
  return "system_event";
}
