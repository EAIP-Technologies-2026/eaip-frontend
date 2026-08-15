"use client";

import { useCallback, useEffect, useState } from "react";
import type { ConductorMessage, ConductorToolActivity } from "@eaip/ui-enterprise";
import { logger } from "@eaip/logging";
import type { ApprovalRequest, CopilotTurn, ToolEvent } from "../services/copilot-service";
import { sendCopilotMessage, fetchPendingApprovals, decideApproval } from "../services/copilot-service";
import { useFallback } from "../services/fallback-context";

let messageCounter = 0;

function nextMessageId(): string {
  messageCounter += 1;
  return `conductor-msg-${String(Date.now())}-${String(messageCounter)}`;
}

function toToolActivities(events: ToolEvent[]): ConductorToolActivity[] {
  return events.map((event) => ({
    tool_name: event.tool_name,
    status: event.status === "ok" || event.status === "executed" ? "executed" : event.status === "denied" ? "denied" : "failed",
    summary: event.summary,
  }));
}

export function useConductor() {
  const { setFallback } = useFallback();
  const [messages, setMessages] = useState<ConductorMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<ApprovalRequest[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const refreshApprovals = useCallback(async () => {
    try {
      const result = await fetchPendingApprovals();
      setFallback("copilot", result.source === "fallback");
      setPending(result.data);
    } catch (err) {
      logger.error("Failed to load Conductor approvals", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, [setFallback]);

  useEffect(() => {
    void refreshApprovals();
  }, [refreshApprovals]);

  const appendAssistant = useCallback((content: string) => {
    setMessages((prev) => [...prev, { id: nextMessageId(), role: "assistant", content }]);
  }, []);

  const applyTurn = useCallback((turn: CopilotTurn, loadingMsgId: string) => {
    const approval = turn.pending_approval;
    if (approval) {
      setPending((prev) => (prev.some((item) => item.id === approval.id) ? prev : [...prev, approval]));
    }
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === loadingMsgId
          ? { ...msg, content: turn.reply, loading: false, toolEvents: toToolActivities(turn.tool_events) }
          : msg,
      ),
    );
  }, []);

  const send = useCallback(
    async (message: string) => {
      const userMsg: ConductorMessage = { id: nextMessageId(), role: "user", content: message };
      const loadingMsgId = nextMessageId();
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: loadingMsgId, role: "assistant", content: "", loading: true },
      ]);
      setLoading(true);
      try {
        const result = await sendCopilotMessage(message);
        setFallback("copilot", result.source === "fallback");
        applyTurn(result.data, loadingMsgId);
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        logger.error("Conductor chat failed", { error: detail });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === loadingMsgId
              ? { ...msg, content: `Conductor unavailable: ${detail}`, loading: false }
              : msg,
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [setFallback, applyTurn],
  );

  const decide = useCallback(
    async (approvalId: string, approve: boolean) => {
      setApprovingId(approvalId);
      try {
        const result = await decideApproval(approvalId, approve);
        setFallback("copilot", result.source === "fallback");
        setPending((prev) => prev.filter((item) => item.id !== approvalId));
        appendAssistant(
          approve
            ? `Approved. ${result.data.result ?? "Action executed."}`
            : "Rejected — no action was taken.",
        );
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        logger.error("Conductor approval decision failed", { error: detail });
        appendAssistant(`Failed to ${approve ? "approve" : "reject"}: ${detail}`);
      } finally {
        setApprovingId(null);
      }
    },
    [setFallback, appendAssistant],
  );

  return { messages, loading, pending, approvingId, send, decide, refreshApprovals };
}
