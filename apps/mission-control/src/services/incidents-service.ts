/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

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
    const { createMonitoringClient } = await import("@eaip/monitoring");
    const client = createMonitoringClient();
    const data = await client.getEvents();
    const raw = Array.isArray(data) ? (data as any[]) : [];
    const incidents: Incident[] = raw.map((item, idx) => {
      const payload = (item.payload as Record<string, unknown>) || {};
      return {
        id: item.id ?? `inc-${String(idx)}`,
        title: (payload.title as string) ?? (payload.message as string) ?? item.eventType ?? "Incident",
        description: (payload.description as string) || undefined,
        severity: (payload.severity as Incident["severity"]) ?? "information",
        status: payload.acknowledged ? "acknowledged" : "open",
        source: item.eventSource ?? "system",
        timestamp: item.timestamp ?? new Date().toISOString(),
        timeline: [{ action: "Incident created", timestamp: item.timestamp ?? new Date().toISOString(), actor: "system" }],
      };
    });
    return liveResult(incidents);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(placeholderIncidents, "Backend unavailable");
    }
    throw err;
  }
}
