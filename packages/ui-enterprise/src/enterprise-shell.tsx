"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlatformStore, useConductorStore } from "@eaip/state";
import { cn } from "@eaip/utilities";
import { EAIPAtmosphere } from "./eaip-atmosphere";
import { EnterpriseSidebar } from "./enterprise-sidebar";
import { ThemeSwitcher } from "./theme-switcher";
import { NotificationBell } from "./notification-bell";
import { ToastContainer } from "./toast";
import type { ShellProps } from "./types";
import { ConductorWidget } from "./ai-assistant";
import type { ConductorMessage, ConductorApproval, ConductorToolActivity } from "./ai-assistant";
import { CommandPalette } from "./command-palette";
import { TourModeBar, TourSpotlight } from "./tour-mode";
import { useTour } from "./use-tour";
import { SpeechOutputService } from "./speech-services";
import { UserProfileMenu } from "./user-profile-menu";

interface ConductorChatResponse {
  id: string;
  reply: string;
  tool_events?: ConductorToolActivity[];
  pending_approval?: ConductorApproval | null;
  conversation_id?: string | null;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("eaip_access_token") ??
    localStorage.getItem("eaip_token") ??
    localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type SseEventName =
  | "message_start"
  | "text_delta"
  | "tool_call"
  | "tool_result"
  | "approval_required"
  | "progress"
  | "message_complete";

const newId = (prefix: string) => prefix + "-" + String(Date.now());

export function EnterpriseShell({ appId, children, breadcrumbs, entityContext }: ShellProps) {
  const router = useRouter();
  const { setActiveRoute, setBreadcrumbs } = usePlatformStore();
  const {
    messages,
    loading,
    approvals,
    approvingId,
    setMessages,
    setLoading,
    setApprovals,
    setApprovingId,
    setMode,
  } = useConductorStore();

  // Phase 8: Guided Tour integration
  const speechOutputRef = useState(() => new SpeechOutputService())[0];
  const conversationIdRef = useRef<string | null>(null);
  const tour = useTour({
    theme:
      typeof document !== "undefined" && document.documentElement.classList.contains("dark")
        ? "dark"
        : "light",
    voiceEnabled: false,
    onNavigate: (route) => {
      if (typeof window !== "undefined" && window.location.pathname !== route) {
        try {
          router.push(route);
        } catch {
          window.location.href = route;
        }
      }
    },
    onNarrate: (text) => {
      if (speechOutputRef.isSupported()) {
        speechOutputRef.speak(text);
      }
    },
  });

  // Fetch initial pending approvals from the unified action inbox if empty
  useEffect(() => {
    let cancelled = false;
    async function loadApprovals() {
      try {
        const headers = getAuthHeaders();
        const res = await fetch("/api/copilot/approval-inbox", { headers });
        if (res.ok && !cancelled) {
          const data = (await res.json()) as { items?: ConductorApproval[] };
          const items = Array.isArray(data.items) ? data.items : [];
          if (items.length > 0) {
            setApprovals(items.map((a) => ({ ...a, id: a.id })));
          } else {
            setApprovals((prev) => (prev.length > 0 ? prev : []));
          }
        }
      } catch {
        // Silently ignore
      }
    }
    if (approvals.length === 0) {
      void loadApprovals();
    }
    return () => {
      cancelled = true;
    };
  }, [approvals.length, setApprovals]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActiveRoute(window.location.pathname, breadcrumbs);
    }
  }, [setActiveRoute, breadcrumbs]);

  useEffect(() => {
    if (breadcrumbs) {
      setBreadcrumbs(breadcrumbs);
    }
  }, [breadcrumbs, setBreadcrumbs]);

  const handleSend = useCallback(
    async (messageText: string) => {
      const userMsg: ConductorMessage = {
        id: newId("usr"),
        role: "user",
        content: messageText,
      };
      const loadingMsg: ConductorMessage = {
        id: newId("ast"),
        role: "assistant",
        content: "",
        loading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setLoading(true);

      try {
        const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
        const res = await fetch("/api/copilot/chat/stream", {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: messageText,
            conversation_id: conversationIdRef.current,
            context: {
              current_route: typeof window !== "undefined" ? window.location.pathname : "/",
              application: "enterprise_console",
              entity_id: entityContext?.entityId,
              entity_type: entityContext?.entityType,
              active_tab: entityContext?.activeTab,
              selected_ids: entityContext?.selectedIds ?? [],
              page_context: entityContext?.pageContext ?? {},
            },
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error(`HTTP ${String(res.status)}`);
        }

        const toolEvents: ConductorToolActivity[] = [];
        let streamedText = "";
        let pendingApproval: ConductorApproval | null = null;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Parse complete SSE frames separated by a blank line.
          const frames = buffer.split("\n\n");
          buffer = frames.pop() ?? "";
          for (const frame of frames) {
            if (!frame.trim()) continue;
            let event = "message";
            const dataLines: string[] = [];
            for (const line of frame.split("\n")) {
              if (line.startsWith("event:")) event = line.slice(6).trim();
              else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
            }
            if (dataLines.length === 0) continue;
            const data = dataLines.join("\n");

            switch (event as SseEventName) {
              case "message_complete": {
                const payload = JSON.parse(data) as {
                  turn?: ConductorChatResponse;
                  conversation_id?: string | null;
                };
                if (payload.turn) {
                  streamedText = payload.turn.reply || streamedText;
                  if (payload.turn.tool_events?.length)
                    toolEvents.push(...payload.turn.tool_events);
                  pendingApproval = payload.turn.pending_approval ?? null;
                  if (payload.turn.conversation_id)
                    conversationIdRef.current = payload.turn.conversation_id;
                }
                if (payload.conversation_id) conversationIdRef.current = payload.conversation_id;
                break;
              }
              case "text_delta": {
                const payload = JSON.parse(data) as { delta?: string; text?: string };
                streamedText += payload.delta ?? payload.text ?? "";
                setMessages((prev) =>
                  prev.map((m) => (m.id === loadingMsg.id ? { ...m, content: streamedText } : m)),
                );
                break;
              }
              case "tool_call": {
                const payload = JSON.parse(data) as {
                  tool_name?: string;
                  arguments?: Record<string, unknown>;
                };
                toolEvents.push({
                  tool_name: payload.tool_name ?? "tool",
                  status: "running",
                });
                break;
              }
              case "tool_result": {
                const payload = JSON.parse(data) as {
                  tool_name?: string;
                  status?: string;
                  summary?: string;
                };
                toolEvents.push({
                  tool_name: payload.tool_name ?? "tool",
                  status: (payload.status ?? "executed") as ConductorToolActivity["status"],
                  summary: payload.summary,
                });
                break;
              }
              case "progress": {
                const payload = JSON.parse(data) as {
                  text?: string;
                  message?: string;
                  step?: string;
                };
                const progressText = payload.text ?? payload.message ?? payload.step;
                if (progressText) {
                  streamedText += progressText;
                  setMessages((prev) =>
                    prev.map((m) => (m.id === loadingMsg.id ? { ...m, content: streamedText } : m)),
                  );
                }
                break;
              }
              default:
                break;
            }
          }
        }

        const assistantMsg: ConductorMessage = {
          id: loadingMsg.id,
          role: "assistant",
          content: streamedText || "Done.",
          toolEvents,
        };
        setMessages((prev) => prev.map((m) => (m.id === loadingMsg.id ? assistantMsg : m)));

        if (pendingApproval) {
          setApprovals((prev) => [...prev, pendingApproval]);
        }
      } catch (err: unknown) {
        const detail = err instanceof Error ? err.message : "Failed to reach Conductor.";
        const errorMsg: ConductorMessage = {
          id: loadingMsg.id,
          role: "assistant",
          content: `Error: ${detail}`,
        };
        setMessages((prev) => prev.map((m) => (m.id === loadingMsg.id ? errorMsg : m)));
      } finally {
        setLoading(false);
      }
    },
    [entityContext, setApprovals, setLoading, setMessages],
  );

  // Do/Ask passthrough from the fused command palette: open Conductor and send.
  useEffect(() => {
    function onAsk(event: Event) {
      const detail = (event as CustomEvent<{ text?: string }>).detail;
      const text = detail.text?.trim();
      if (!text) return;
      setMode("expanded");
      void handleSend(text);
    }
    window.addEventListener("eaip:conductor-ask", onAsk);
    return () => {
      window.removeEventListener("eaip:conductor-ask", onAsk);
    };
  }, [handleSend, setMode]);

  const handleApprove = async (approvalId: string) => {
    setApprovingId(approvalId);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/copilot/approvals/${approvalId}/approve`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
        setMessages((prev) => [
          ...prev,
          {
            id: newId("appr-done"),
            role: "assistant",
            content: "Action approved and executed successfully.",
          },
        ]);
      }
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (approvalId: string) => {
    setApprovingId(approvalId);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/copilot/approvals/${approvalId}/reject`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
        setMessages((prev) => [
          ...prev,
          {
            id: newId("appr-rej"),
            role: "assistant",
            content: "Action rejected. No changes made.",
          },
        ]);
      }
    } finally {
      setApprovingId(null);
    }
  };

  const intensity = getAtmosphereIntensity(appId);
  const { sidebarOpen } = usePlatformStore();

  return (
    <div className="bg-surface-base relative min-h-screen">
      <EAIPAtmosphere intensity={intensity} />
      <EnterpriseSidebar appId={appId} />
      {/* Top-right utility header — theme + notifications + profile */}
      <header
        className={cn(
          "fixed top-0 right-0 z-40 flex items-center gap-2 px-4 py-2.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:px-5",
          sidebarOpen ? "md:left-[250px]" : "md:left-[62px]",
        )}
      >
        <div className="ml-auto flex items-center gap-1">
          <ThemeSwitcher compact />
          <NotificationBell />
          <div className="border-border/40 ml-1 border-l pl-2">
            <UserProfileMenu />
          </div>
        </div>
      </header>
      <main
        id="main-content"
        className={cn(
          "relative z-10 min-w-0 overflow-x-hidden pt-16 pb-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:pt-14 md:pb-0",
          sidebarOpen ? "md:pl-[250px]" : "md:pl-[62px]",
        )}
      >
        <div className="page-enter min-w-0 overflow-hidden px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto max-w-[1400px] min-w-0 overflow-hidden">
            {/* Tour Invitation — removed from dashboard per COPILOT-NATIVE GUIDANCE: Copilot is the natural guide, no persistent banner */}

            {/* Tour Mode Bar — visible when tour is active */}
            {tour.isTourActive && (
              <div className="mb-4">
                <TourModeBar
                  active={tour.isTourActive}
                  state={tour.tourState}
                  currentStep={tour.currentStep}
                  currentStepIndex={tour.currentStepIndex}
                  totalSteps={tour.totalSteps}
                  onPause={() => void tour.pause()}
                  onResume={() => void tour.resume()}
                  onPrevious={() => void tour.previous()}
                  onNext={() => void tour.next()}
                  onStop={() => void tour.stop()}
                  onSkip={() => void tour.skip()}
                />
              </div>
            )}

            {children}
          </div>
        </div>
      </main>
      <ToastContainer />
      <CommandPalette />
      {tour.isTourActive && (
        <TourSpotlight
          active={tour.isTourActive}
          state={tour.tourState}
          currentStep={tour.currentStep}
          currentStepIndex={tour.currentStepIndex}
          totalSteps={tour.totalSteps}
          narration={tour.narration}
          onNext={() => void tour.next()}
          onPrevious={() => void tour.previous()}
          onSkip={() => void tour.skip()}
          onStop={() => void tour.stop()}
        />
      )}
      <ConductorWidget
        messages={messages}
        onSend={(text) => void handleSend(text)}
        loading={loading}
        approvals={approvals}
        approvingId={approvingId}
        onApprove={(id) => void handleApprove(id)}
        onReject={(id) => void handleReject(id)}
      />
    </div>
  );
}

function getAtmosphereIntensity(
  _appId: string,
):
  | "dashboard"
  | "brains"
  | "brain-detail"
  | "activity"
  | "knowledge"
  | "missions"
  | "monitoring"
  | "administration" {
  if (typeof window === "undefined") return "dashboard";
  const path = window.location.pathname;
  if (path.includes("/brains/")) return "brain-detail";
  if (path.startsWith("/brains")) return "brains";
  if (path.startsWith("/activity")) return "activity";
  if (path.startsWith("/knowledge")) return "knowledge";
  if (path.startsWith("/missions")) return "missions";
  if (path.startsWith("/monitoring")) return "monitoring";
  if (path.startsWith("/administration")) return "administration";
  return "dashboard";
}
