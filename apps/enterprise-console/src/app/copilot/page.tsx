"use client";

import { useEffect, useRef, useState } from "react";
import { RequireAuth } from "@eaip/auth";
import {
  EnterpriseShell,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  PersonalAssistantMark,
} from "@eaip/ui-enterprise";
import { Badge, Button, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

interface ToolActivity {
  tool_name: string;
  status: "running" | "executed" | "denied" | "failed";
  summary?: string;
}

interface StudioMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  loading?: boolean;
  toolEvents?: ToolActivity[];
}

interface ApprovalPayload {
  approval_id: string;
  tool_name: string;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token =
    localStorage.getItem("eaip_access_token") ??
    localStorage.getItem("eaip_token") ??
    localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const newId = (prefix: string) => prefix + "-" + String(Date.now());

function parseSseFrames(buffer: string): { frames: string[]; rest: string } {
  const frames = buffer.split("\n\n");
  const rest = frames.pop() ?? "";
  return { frames, rest };
}

function CopilotStudioContent() {
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [toolLog, setToolLog] = useState<ToolActivity[]>([]);
  const [responses, setResponses] = useState<StudioMessage[]>([
    {
      id: "initial-1",
      role: "assistant",
      text: "Welcome to EAIP Copilot Studio. I am Conductor, your enterprise AI operating system.\n\nAsk me about what is happening in the company, what changed, what is at risk, what needs your approval, or give me a governed command — every action is audited.",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [responses]);

  const handleSendPrompt = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || isSubmitting) return;
    setPrompt("");
    setIsSubmitting(true);

    const userMsg: StudioMessage = {
      id: newId("usr"),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    const loadingMsg: StudioMessage = {
      id: newId("ast"),
      role: "assistant",
      text: "",
      loading: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setResponses((prev) => [...prev, userMsg, loadingMsg]);

    try {
      const headers = { "Content-Type": "application/json", ...getAuthHeaders() };
      const res = await fetch("/api/copilot/chat/stream", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          context: {
            current_route: typeof window !== "undefined" ? window.location.pathname : "/",
            application: "enterprise_console",
            selected_ids: [],
            page_context: {},
          },
        }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${String(res.status)}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamed = "";
      const toolEvents: ToolActivity[] = [];

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const { frames, rest } = parseSseFrames(buffer);
        buffer = rest;

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

          if (event === "message_start") {
            const payload = JSON.parse(data) as { conversation_id?: string | null };
            if (payload.conversation_id) setConversationId(payload.conversation_id);
          } else if (event === "text_delta") {
            const payload = JSON.parse(data) as { delta?: string };
            streamed += payload.delta ?? "";
            setResponses((prev) =>
              prev.map((m) => (m.id === loadingMsg.id ? { ...m, text: streamed } : m)),
            );
          } else if (event === "tool_call") {
            const payload = JSON.parse(data) as { tool_name?: string };
            toolEvents.push({ tool_name: payload.tool_name ?? "tool", status: "running" });
            setToolLog((prev) => [...prev, ...toolEvents]);
          } else if (event === "tool_result") {
            const payload = JSON.parse(data) as {
              tool_name?: string;
              status?: string;
              summary?: string;
            };
            toolEvents.push({
              tool_name: payload.tool_name ?? "tool",
              status: (payload.status ?? "executed") as ToolActivity["status"],
              summary: payload.summary,
            });
            setToolLog((prev) => [...prev, ...toolEvents]);
          } else if (event === "approval_required") {
            const payload = JSON.parse(data) as ApprovalPayload;
            toolEvents.push({ tool_name: payload.tool_name, status: "running" });
            setToolLog((prev) => [...prev, ...toolEvents]);
          } else if (event === "message_complete") {
            const payload = JSON.parse(data) as {
              turn?: { reply?: string; tool_events?: ToolActivity[] };
              conversation_id?: string | null;
            };
            if (payload.conversation_id) setConversationId(payload.conversation_id);
            if (payload.turn?.reply) streamed = payload.turn.reply;
            if (payload.turn?.tool_events?.length) toolEvents.push(...payload.turn.tool_events);
          }
        }
      }

      setResponses((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? { ...m, text: streamed || "Done.", loading: false, toolEvents }
            : m,
        ),
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Failed to reach Conductor.";
      setResponses((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id ? { ...m, text: `Error: ${detail}`, loading: false } : m,
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const samplePrompts = [
    "What's at risk right now?",
    "Why did this KPI change?",
    "What needs my approval?",
    "Give me a briefing on the company.",
  ];

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Copilot Studio"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Copilot Studio" }]}
    >
      <div className="space-y-6">
        <div className="liquid-glass rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <PersonalAssistantMark size="lg" state={isSubmitting ? "thinking" : "idle"} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-primary text-xs font-bold tracking-wider uppercase">
                    Autonomous Intelligence OS
                  </p>
                  <Badge variant="primary">Conductor v2.0</Badge>
                </div>
                <h1 className="text-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Copilot Studio
                </h1>
                <p className="text-text-secondary mt-1 max-w-2xl text-sm">
                  A full-screen session with the real Conductor service — grounded in live
                  enterprise state, streamed token-by-token, with every governed action audited.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card liquid padding="md" className="flex h-[540px] flex-col">
              <CardHeader className="border-border/50 border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EnterpriseIcon name="cpu" size={18} className="text-primary" />
                    <CardTitle>Live Reasoning Session</CardTitle>
                  </div>
                  <Badge variant="success">{isSubmitting ? "Streaming" : "Active"}</Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4 overflow-y-auto py-4 pr-1">
                <div ref={scrollRef} className="space-y-4">
                  {responses.map((res) => (
                    <div
                      key={res.id}
                      className={`flex gap-3 ${res.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {res.role === "assistant" ? (
                        <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                          <EnterpriseIcon name="sparkles" size={16} />
                        </div>
                      ) : null}
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                          res.role === "user"
                            ? "bg-primary rounded-br-none text-white"
                            : "bg-surface-secondary/80 border-border/50 text-text rounded-bl-none border"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{res.text}</p>
                        {res.toolEvents && res.toolEvents.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {res.toolEvents.map((t, i) => (
                              <span
                                key={`${res.id}-tool-${String(i)}`}
                                className="bg-primary-subtle text-primary mr-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]"
                              >
                                <EnterpriseIcon name="bolt" size={10} />
                                {t.tool_name} · {t.status}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <span
                          className={`mt-2 block text-[10px] ${res.role === "user" ? "text-white/70" : "text-text-muted"}`}
                        >
                          {res.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              <div className="border-border/50 border-t pt-3">
                <form
                  onSubmit={(e) => {
                    void handleSendPrompt(e);
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                    }}
                    placeholder="Ask Conductor about the company, risks, approvals, or give a governed command..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    iconRight="arrowRight"
                  >
                    Send
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card liquid padding="md">
              <CardHeader>
                <CardTitle>Suggested Prompts</CardTitle>
              </CardHeader>
              <CardContent className="mt-3 space-y-2">
                {samplePrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPrompt(p);
                    }}
                    className="border-border/50 bg-surface-secondary/40 text-text hover:border-primary/50 hover:bg-primary-subtle/30 transition-smooth flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs font-medium"
                  >
                    <span>{p}</span>
                    <EnterpriseIcon
                      name="chevronRight"
                      size={14}
                      className="text-text-muted shrink-0"
                    />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card liquid padding="md">
              <CardHeader>
                <CardTitle>Tool Activity</CardTitle>
              </CardHeader>
              <CardContent className="mt-3 space-y-2">
                {toolLog.length === 0 ? (
                  <p className="text-text-muted text-xs">No tools invoked in this session yet.</p>
                ) : (
                  toolLog.slice(-8).map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-text font-medium">{t.tool_name}</span>
                      <Badge
                        variant={
                          t.status === "failed"
                            ? "danger"
                            : t.status === "denied"
                              ? "warning"
                              : "success"
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card liquid padding="md">
              <CardHeader>
                <CardTitle>Operational Guardrails</CardTitle>
              </CardHeader>
              <CardContent className="text-text-secondary mt-3 space-y-3 text-xs">
                <div className="border-border/40 flex items-center justify-between border-b py-1">
                  <span>Data Leakage Prevention</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="border-border/40 flex items-center justify-between border-b py-1">
                  <span>Human-in-the-Loop</span>
                  <Badge variant="primary">Enforced</Badge>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Audit Logging</span>
                  <Badge variant="success">100% Verifiable</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}

export default function CopilotStudioPage() {
  return (
    <RequireAuth>
      <CopilotStudioContent />
    </RequireAuth>
  );
}
