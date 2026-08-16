"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePlatformStore, useConductorStore } from "@eaip/state";
import { EAIPAtmosphere } from "./eaip-atmosphere";
import { LiquidGlassNav } from "./liquid-glass-nav";
import { ToastContainer } from "./toast";
import type { ShellProps } from "./types";
import { ConductorWidget } from "./ai-assistant";
import type {
  ConductorMessage,
  ConductorApproval,
  ConductorToolActivity,
} from "./ai-assistant";
import { TourInvitation } from "./tour-invitation";
import { TourModeBar, TourSpotlight } from "./tour-mode";
import { useTour } from "./use-tour";
import { SpeechOutputService } from "./speech-services";

interface ConductorChatResponse {
  id: string;
  reply: string;
  tool_events?: ConductorToolActivity[];
  pending_approval?: ConductorApproval | null;
  conversation_id?: string | null;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("eaip_access_token") ?? localStorage.getItem("eaip_token") ?? localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
  } = useConductorStore();

  // Phase 8: Guided Tour integration
  const speechOutputRef = useState(() => new SpeechOutputService())[0];
  const conversationIdRef = useRef<string | null>(null);
  const tour = useTour({
    theme: typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light",
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

  // Fetch initial pending approvals if empty
  useEffect(() => {
    let cancelled = false;
    async function loadApprovals() {
      try {
        const headers = getAuthHeaders();
        const res = await fetch("/api/copilot/approvals", { headers });
        if (res.ok && !cancelled) {
          const data = (await res.json()) as ConductorApproval[];
          if (Array.isArray(data) && data.length > 0) {
            setApprovals(data);
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

  const handleSend = async (messageText: string) => {
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
      const res = await fetch("/api/copilot/chat", {
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

      if (!res.ok) {
        throw new Error(`HTTP ${String(res.status)}`);
      }

      const data = (await res.json()) as ConductorChatResponse;
      if (data.conversation_id) {
        conversationIdRef.current = data.conversation_id;
      }
      const assistantMsg: ConductorMessage = {
        id: data.id,
        role: "assistant",
        content: data.reply || "Done.",
        toolEvents: data.tool_events ?? [],
      };

      const pendingApproval = data.pending_approval;
      if (pendingApproval) {
        setApprovals((prev) => [...prev, pendingApproval]);
      }

      setMessages((prev) => prev.map((m) => (m.id === loadingMsg.id ? assistantMsg : m)));
    } catch (err: unknown) {
      const detail = err instanceof Error ? err.message : "Failed to reach Conductor.";
      const errorMsg: ConductorMessage = {
        id: newId("err"),
        role: "assistant",
        content: `Error: ${detail}`,
      };
      setMessages((prev) => prev.map((m) => (m.id === loadingMsg.id ? errorMsg : m)));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approvalId: string) => {
    setApprovingId(approvalId);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/copilot/approvals/${approvalId}/approve`, { method: "POST", headers });
      if (res.ok) {
        setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
        setMessages((prev) => [
          ...prev,
          { id: newId("appr-done"), role: "assistant", content: "Action approved and executed successfully." },
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
      const res = await fetch(`/api/copilot/approvals/${approvalId}/reject`, { method: "POST", headers });
      if (res.ok) {
        setApprovals((prev) => prev.filter((a) => a.id !== approvalId));
        setMessages((prev) => [
          ...prev,
          { id: newId("appr-rej"), role: "assistant", content: "Action rejected. No changes made." },
        ]);
      }
    } finally {
      setApprovingId(null);
    }
  };

  const intensity = getAtmosphereIntensity(appId);

  return (
    <div className="relative min-h-screen">
      <EAIPAtmosphere intensity={intensity} />
      <LiquidGlassNav appId={appId} />
      <main
        id="main-content"
        className="relative z-10 pt-16 pb-20 transition-all duration-300 md:pt-20 md:pb-0"
      >
        <div className="page-enter px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <div className="mx-auto min-w-0 max-w-[1400px]">
            {/* Tour Invitation — unobtrusive, top of content area */}
            {tour.showInvitation && (
              <div className="mb-4">
                <TourInvitation
                  visible={tour.showInvitation}
                  onAccept={() => void tour.acceptTour()}
                  onDismiss={tour.dismissInvitation}
                  onClose={tour.dismissInvitation}
                />
              </div>
            )}

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
): "dashboard" | "brains" | "brain-detail" | "activity" | "knowledge" | "missions" | "monitoring" | "administration" {
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
