import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface Incident {
  id: string;
  title: string;
  description?: string;
  severity: "critical" | "warning" | "information";
  status: "open" | "acknowledged" | "resolved";
  source: string;
  timestamp: string;
  assignedTo?: string;
  timeline: { action: string; timestamp: string; actor: string }[];
}

const placeholderIncidents: Incident[] = [
  { id: "inc-1", title: "Search Indexer Down", description: "Search Indexer agent is unresponsive", severity: "critical", status: "open", source: "agent-4", timestamp: new Date(Date.now() - 900000).toISOString(), timeline: [{ action: "Incident created", timestamp: new Date(Date.now() - 900000).toISOString(), actor: "system" }] },
  { id: "inc-2", title: "High Memory on Monitoring Agent", description: "Memory usage at 91% - approaching threshold", severity: "warning", status: "acknowledged", source: "agent-3", timestamp: new Date(Date.now() - 600000).toISOString(), assignedTo: "Alex Rivera", timeline: [
    { action: "Incident created", timestamp: new Date(Date.now() - 600000).toISOString(), actor: "system" },
    { action: "Assigned to Alex Rivera", timestamp: new Date(Date.now() - 300000).toISOString(), actor: "Jordan Patel" },
  ]},
  { id: "inc-3", title: "Pipeline OOM Crash", description: "Data Pipeline agent crashed with out of memory error", severity: "critical", status: "open", source: "agent-8", timestamp: new Date(Date.now() - 7200000).toISOString(), timeline: [{ action: "Incident created", timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "system" }] },
  { id: "inc-4", title: "Scheduled Maintenance", description: "Planned system maintenance completed", severity: "information", status: "resolved", source: "system", timestamp: new Date(Date.now() - 3600000).toISOString(), assignedTo: "Sam Chen", timeline: [
    { action: "Maintenance started", timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "Sam Chen" },
    { action: "Maintenance completed", timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "Sam Chen" },
  ]},
  { id: "inc-5", title: "Code Reviewer Recovery", description: "Code Reviewer agent recovered after restart", severity: "information", status: "resolved", source: "agent-2", timestamp: new Date(Date.now() - 1800000).toISOString(), timeline: [
    { action: "Agent restarted", timestamp: new Date(Date.now() - 1800000).toISOString(), actor: "system" },
    { action: "Health check passed", timestamp: new Date(Date.now() - 1790000).toISOString(), actor: "system" },
  ]},
];

export async function fetchIncidents(): Promise<ServiceResult<Incident[]>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const res = await client.get<unknown[]>("/monitoring/events");
    if (res.error) throw res.error;
    const raw = Array.isArray(res.data) ? res.data as Record<string, unknown>[] : [];
    const incidents: Incident[] = raw.map((item, idx) => ({
      id: (item.id as string | undefined) ?? `inc-${String(idx)}`,
      title: (item.title as string | undefined) ?? (item.message as string | undefined) ?? "Incident",
      description: item.description as string | undefined,
      severity: (item.severity as Incident["severity"] | undefined) ?? "information",
      status: item.acknowledged ? "acknowledged" : "open",
      source: (item.source as string | undefined) ?? "system",
      timestamp: (item.timestamp as string | undefined) ?? new Date().toISOString(),
      timeline: [{ action: "Incident created", timestamp: (item.timestamp as string | undefined) ?? new Date().toISOString(), actor: "system" }],
    }));
    return liveResult(incidents);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderIncidents, "Backend unavailable");
    }
    throw err;
  }
}
