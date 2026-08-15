import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";
import { createMockCopilotTurn, createMockPendingApprovals } from "../mock-data/data";

export type RiskTier = "informational" | "action" | "destructive";
export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export interface ToolEvent {
  tool_name: string;
  status: string;
  summary?: string;
  arguments?: Record<string, unknown>;
  audit_entry_id?: string | null;
}

export interface ApprovalRequest {
  id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  requester_id: string;
  risk: RiskTier;
  status: ApprovalStatus;
  created_at: string;
  decided_at?: string | null;
  decided_by?: string | null;
  result?: string | null;
}

export interface CopilotTurn {
  id: string;
  reply: string;
  tool_events: ToolEvent[];
  pending_approval?: ApprovalRequest | null;
  conversation_id?: string | null;
  correlation_id?: string | null;
  created_at: string;
}

export interface ApprovalDecision {
  approval: ApprovalRequest;
  result?: string | null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function parseApproval(raw: unknown): ApprovalRequest | null {
  const o = asRecord(raw);
  if (!o) return null;
  if (typeof o.id !== "string" || typeof o.tool_name !== "string") return null;
  const risk = o.risk === "informational" || o.risk === "destructive" || o.risk === "action" ? o.risk : "action";
  const status = o.status === "approved" || o.status === "rejected" || o.status === "expired" ? o.status : "pending";
  return {
    id: o.id,
    tool_name: o.tool_name,
    arguments: asRecord(o.arguments) ?? {},
    requester_id: typeof o.requester_id === "string" ? o.requester_id : "",
    risk,
    status,
    created_at: typeof o.created_at === "string" ? o.created_at : new Date().toISOString(),
    decided_at: typeof o.decided_at === "string" ? o.decided_at : null,
    decided_by: typeof o.decided_by === "string" ? o.decided_by : null,
    result: typeof o.result === "string" ? o.result : null,
  };
}

function parseToolEvent(raw: unknown): ToolEvent | null {
  const o = asRecord(raw);
  if (!o) return null;
  if (typeof o.tool_name !== "string") return null;
  return {
    tool_name: o.tool_name,
    status: typeof o.status === "string" ? o.status : "unknown",
    summary: typeof o.summary === "string" ? o.summary : "",
    arguments: asRecord(o.arguments) ?? {},
    audit_entry_id: typeof o.audit_entry_id === "string" ? o.audit_entry_id : null,
  };
}

function parseTurn(raw: unknown): CopilotTurn | null {
  const o = asRecord(raw);
  if (!o) return null;
  if (typeof o.reply !== "string") return null;
  return {
    id: typeof o.id === "string" ? o.id : `turn-${String(Date.now())}`,
    reply: o.reply,
    tool_events: Array.isArray(o.tool_events)
      ? o.tool_events.map(parseToolEvent).filter((event): event is ToolEvent => event !== null)
      : [],
    pending_approval: o.pending_approval ? parseApproval(o.pending_approval) : null,
    conversation_id: typeof o.conversation_id === "string" ? o.conversation_id : null,
    correlation_id: typeof o.correlation_id === "string" ? o.correlation_id : null,
    created_at: typeof o.created_at === "string" ? o.created_at : new Date().toISOString(),
  };
}

export async function sendCopilotMessage(
  message: string,
  conversationId?: string,
): Promise<ServiceResult<CopilotTurn>> {
  try {
    const client = getDefaultClient();
    const response = await client.post<unknown>("/copilot/chat", {
      message,
      conversation_id: conversationId ?? null,
    });
    if (response.error) throw response.error;
    const turn = parseTurn(response.data);
    if (!turn) throw new Error("Unexpected copilot response");
    return liveResult(turn);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        createMockCopilotTurn(message),
        err instanceof Error ? err.message : "Backend unavailable",
      );
    }
    throw err;
  }
}

export async function fetchPendingApprovals(): Promise<ServiceResult<ApprovalRequest[]>> {
  try {
    const client = getDefaultClient();
    const response = await client.get<unknown>("/copilot/approvals");
    if (response.error) throw response.error;
    const items = Array.isArray(response.data)
      ? response.data.map(parseApproval).filter((item): item is ApprovalRequest => item !== null)
      : [];
    return liveResult(items);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        createMockPendingApprovals(),
        err instanceof Error ? err.message : "Backend unavailable",
      );
    }
    throw err;
  }
}

export async function decideApproval(
  approvalId: string,
  approve: boolean,
): Promise<ServiceResult<ApprovalDecision>> {
  const action = approve ? "approve" : "reject";
  const path = `/copilot/approvals/${encodeURIComponent(approvalId)}/${action}`;
  try {
    const client = getDefaultClient();
    const response = await client.post<unknown>(path);
    if (response.error) throw response.error;
    const data = asRecord(response.data);
    const approval = data ? parseApproval(data.approval) : null;
    if (!approval) throw new Error("Unexpected approval response");
    return liveResult({
      approval,
      result: data && typeof data.result === "string" ? data.result : null,
    });
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(
        {
          approval: {
            id: approvalId,
            tool_name: "unknown",
            arguments: {},
            requester_id: "local",
            risk: "action",
            status: approve ? "approved" : "rejected",
            created_at: new Date().toISOString(),
          },
          result: null,
        },
        err instanceof Error ? err.message : "Backend unavailable",
      );
    }
    throw err;
  }
}
