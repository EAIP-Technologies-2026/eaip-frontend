/**
 * EAIP Conductor Phase 9 — Investigation types and API client.
 */

export type InvestigationStatus =
  | "draft"
  | "active"
  | "paused"
  | "waiting"
  | "resolved"
  | "archived"
  | "cancelled";

export type InvestigationPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type EvidenceType =
  | "observed"
  | "inferred"
  | "recommended";

export type EvidenceSource =
  | "tool"
  | "knowledge"
  | "memory"
  | "event"
  | "user"
  | "system";

export interface InvestigationSummary {
  id: string;
  tenant_id: string;
  owner_id: string;
  title: string;
  objective: string;
  status: InvestigationStatus;
  priority: InvestigationPriority;
  current_stage: string;
  summary: string;
  findings: string[];
  recommendations: string[];
  unresolved_questions: string[];
  evidence_count: number;
  hypothesis_count: number;
  reasoning_steps_used: number;
  max_reasoning_steps: number;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  completed_at: string | null;
  expires_at: string | null;
  retention_policy: string;
  provenance: string;
}

export interface InvestigationEvidence {
  id: string;
  investigation_id: string;
  evidence_type: EvidenceType;
  source: EvidenceSource;
  content: string;
  source_tool: string;
  source_route: string;
  confidence: number;
  timestamp: string;
  stale: boolean;
  stale_reason: string;
  correlation_id: string;
}

export interface TimelineEvent {
  id: string;
  investigation_id: string;
  timestamp: string;
  event_type: string;
  description: string;
  actor_id: string;
  evidence_id: string;
}

export interface InvestigationHypothesis {
  id: string;
  investigation_id: string;
  statement: string;
  confidence: number;
  supporting_evidence_ids: string[];
  contradicting_evidence_ids: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

const INV_API = "/api/copilot/investigations";

export async function listInvestigations(params?: {
  status?: string;
  limit?: number;
}): Promise<InvestigationSummary[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.limit) qs.set("limit", String(params.limit));
  const url = qs.toString() ? `${INV_API}?${qs}` : INV_API;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`List failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationSummary[]>;
}

export async function getInvestigation(
  id: string,
): Promise<InvestigationSummary> {
  const res = await fetch(`${INV_API}/${id}`);
  if (!res.ok) throw new Error(`Get failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationSummary>;
}

export async function createInvestigation(body: {
  title: string;
  objective: string;
  priority?: string;
}): Promise<InvestigationSummary> {
  const res = await fetch(INV_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Create failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationSummary>;
}

export async function startInvestigation(
  id: string,
): Promise<InvestigationSummary> {
  const res = await fetch(`${INV_API}/${id}/start`, { method: "POST" });
  if (!res.ok) throw new Error(`Start failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationSummary>;
}

export async function pauseInvestigation(
  id: string,
): Promise<InvestigationSummary> {
  const res = await fetch(`${INV_API}/${id}/pause`, { method: "POST" });
  if (!res.ok) throw new Error(`Pause failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationSummary>;
}

export async function resumeInvestigation(
  id: string,
): Promise<InvestigationSummary> {
  const res = await fetch(`${INV_API}/${id}/resume`, { method: "POST" });
  if (!res.ok) throw new Error(`Resume failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationSummary>;
}

export async function resolveInvestigation(
  id: string,
  body?: { summary?: string; findings?: string[]; recommendations?: string[] },
): Promise<InvestigationSummary> {
  const res = await fetch(`${INV_API}/${id}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!res.ok) throw new Error(`Resolve failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationSummary>;
}

export async function archiveInvestigation(
  id: string,
): Promise<InvestigationSummary> {
  const res = await fetch(`${INV_API}/${id}/archive`, { method: "POST" });
  if (!res.ok) throw new Error(`Archive failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationSummary>;
}

export async function getTimeline(
  id: string,
): Promise<TimelineEvent[]> {
  const res = await fetch(`${INV_API}/${id}/timeline`);
  if (!res.ok)
    throw new Error(`Timeline failed: ${String(res.status)}`);
  return res.json() as Promise<TimelineEvent[]>;
}

export async function getEvidence(
  id: string,
): Promise<InvestigationEvidence[]> {
  const res = await fetch(`${INV_API}/${id}/evidence`);
  if (!res.ok)
    throw new Error(`Evidence failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationEvidence[]>;
}

export async function getHypotheses(
  id: string,
): Promise<InvestigationHypothesis[]> {
  const res = await fetch(`${INV_API}/${id}/hypotheses`);
  if (!res.ok)
    throw new Error(`Hypotheses failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationHypothesis[]>;
}

export async function findResumable(
  query?: string,
): Promise<InvestigationSummary | null> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : "";
  const res = await fetch(`${INV_API}/resumable${qs}`);
  if (!res.ok)
    throw new Error(`Resumable failed: ${String(res.status)}`);
  return res.json() as Promise<InvestigationSummary | null>;
}
