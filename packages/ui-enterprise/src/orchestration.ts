/**
 * EAIP Conductor Phase 10 — Orchestration types and API client.
 */

import { getAuthHeaders, getJsonAuthHeaders } from "./auth-headers";

export type PlanStatus =
  | "draft"
  | "ready"
  | "awaiting_approval"
  | "approved"
  | "running"
  | "paused"
  | "blocked"
  | "failed"
  | "cancelled"
  | "completed"
  | "partial_success"
  | "rolled_back";

export type PlanRisk = "informational" | "action" | "destructive";

export type StepStatus =
  | "pending"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "rolled_back"
  | "blocked";

export type FailureClass =
  | "transient"
  | "permission"
  | "validation"
  | "dependency"
  | "timeout"
  | "policy"
  | "unknown";

export interface PlanStepSummary {
  id: string;
  description: string;
  tool_name: string;
  risk: PlanRisk;
  status: StepStatus;
  dependencies: string[];
  approval_required: boolean;
  reversible: boolean;
  result: string;
  error: string;
  failure_class: FailureClass;
  retry_count: number;
}

export interface BudgetSummary {
  max_steps: number;
  max_tool_calls: number;
  max_retries: number;
  max_execution_seconds: number;
  max_concurrent_steps: number;
  max_destructive_actions: number;
  max_rollbacks: number;
}

export interface OrchestrationPlanSummary {
  id: string;
  tenant_id: string;
  owner_id: string;
  objective: string;
  description: string;
  status: PlanStatus;
  risk: PlanRisk;
  steps: PlanStepSummary[];
  current_step_index: number;
  estimated_risk: PlanRisk;
  approval_required: boolean;
  investigation_id: string;
  budget: BudgetSummary;
  tool_calls_used: number;
  retries_used: number;
  rollbacks_used: number;
  result_summary: string;
  failure_info: string;
  plan_hash: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  provenance: string;
}

export interface TimelineEvent {
  timestamp: string;
  event: string;
  description: string;
  step_id?: string;
  result?: string;
  error?: string;
}

const ORCH_API = "/api/copilot/orchestrations";

export async function listPlans(params?: {
  status?: string;
  limit?: number;
}): Promise<OrchestrationPlanSummary[]> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.limit) qs.set("limit", String(params.limit));
  const url = qs.toString() ? `${ORCH_API}?${qs}` : ORCH_API;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`List failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary[]>;
}

export async function getPlan(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Get failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function createPlan(body: {
  objective: string;
  description?: string;
  steps?: Record<string, unknown>[];
  estimated_risk?: string;
}): Promise<OrchestrationPlanSummary> {
  const res = await fetch(ORCH_API, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Create failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function readyPlan(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}/ready`, { method: "POST", headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`Ready failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function requestApproval(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}/request-approval`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error(`Request approval failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function approvePlan(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}/approve`, { method: "POST", headers: getAuthHeaders() });
  if (!res.ok)
    throw new Error(`Approve failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function executePlan(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}/execute`, { method: "POST", headers: getAuthHeaders() });
  if (!res.ok)
    throw new Error(`Execute failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function executeSteps(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}/execute-steps`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error(`Execute steps failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function pausePlan(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}/pause`, { method: "POST", headers: getAuthHeaders() });
  if (!res.ok)
    throw new Error(`Pause failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function resumePlan(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}/resume`, { method: "POST", headers: getAuthHeaders() });
  if (!res.ok)
    throw new Error(`Resume failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function cancelPlan(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}/cancel`, { method: "POST", headers: getAuthHeaders() });
  if (!res.ok)
    throw new Error(`Cancel failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function rollbackPlan(
  id: string,
): Promise<OrchestrationPlanSummary> {
  const res = await fetch(`${ORCH_API}/${id}/rollback`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok)
    throw new Error(`Rollback failed: ${String(res.status)}`);
  return res.json() as Promise<OrchestrationPlanSummary>;
}

export async function getTimeline(
  id: string,
): Promise<TimelineEvent[]> {
  const res = await fetch(`${ORCH_API}/${id}/timeline`, { headers: getAuthHeaders() });
  if (!res.ok)
    throw new Error(`Timeline failed: ${String(res.status)}`);
  return res.json() as Promise<TimelineEvent[]>;
}
