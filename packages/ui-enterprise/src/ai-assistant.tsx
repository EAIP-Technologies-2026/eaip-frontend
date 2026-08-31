import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@eaip/core";
import { Button, Spinner, Avatar } from "@eaip/ui-primitives";
import { Tooltip } from "@eaip/ui-foundation";
import { useConductorStore } from "@eaip/state";
import { SpeechInputService, SpeechOutputService, type VoiceState } from "./speech-services";
import { PersonalAssistantMark } from "./personal-assistant-mark";
import { DynamicConductorButton, type ConductorButtonState } from "./dynamic-conductor-button";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  loading?: boolean;
}

export interface AIChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  loading?: boolean;
  placeholder?: string;
  title?: string;
  className?: string;
}

export function AIChatPanel({
  messages,
  onSend,
  loading = false,
  placeholder = "Ask anything...",
  title = "AI Assistant",
  className,
}: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div
      className={cn(
        "rounded-card border-border bg-surface flex flex-col overflow-hidden border",
        className,
      )}
    >
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-text-inverse flex h-7 w-7 items-center justify-center rounded-full">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-text text-sm font-semibold">{title}</span>
        </div>
        <Tooltip content="New conversation">
          <Button type="button" variant="ghost" size="sm" iconOnly>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        </Tooltip>
      </div>

      <div
        ref={listRef}
        className="max-h-[500px] min-h-[300px] flex-1 space-y-3 overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-8 text-center">
            <div className="bg-primary-subtle text-primary mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-text text-sm font-medium">How can I help you today?</p>
            <p className="text-text-muted mt-1 text-xs">Ask a question or describe a task</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="bg-primary-subtle text-primary mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
            <div
              className={cn(
                "rounded-card max-w-[80%] px-3 py-2 text-sm",
                msg.role === "user"
                  ? "bg-primary text-text-inverse"
                  : "bg-surface-secondary text-text border-border border",
              )}
            >
              {msg.loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-text-muted">Thinking...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="bg-surface-tertiary text-text-muted mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                <Avatar name="You" size="sm" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-border border-t p-4">
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={placeholder}
              disabled={loading}
              className="rounded-input bg-surface text-text transition-smooth border-border focus:border-primary focus:ring-primary placeholder:text-text-muted block w-full border px-3 py-2.5 pr-10 text-sm shadow-sm focus:ring-1 focus:outline-none disabled:opacity-50"
              aria-label="Chat input"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface ConductorToolActivity {
  tool_name: string;
  status: "running" | "executed" | "denied" | "failed";
  summary?: string;
}

export interface ConductorMessage extends ChatMessage {
  toolEvents?: ConductorToolActivity[];
}

export interface ConductorApproval {
  id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  risk?: string;
  created_at?: string;
  status?: string;
}

export interface ConductorWidgetProps {
  messages: ConductorMessage[];
  onSend: (message: string) => void;
  loading?: boolean;
  initialMode?: "collapsed" | "docked" | "expanded";
  approvals?: ConductorApproval[];
  approvingId?: string | null;
  onApprove?: (approvalId: string) => void;
  onReject?: (approvalId: string) => void;
  className?: string;
}

function approvalSummary(approval: ConductorApproval): string {
  const entries = Object.entries(approval.arguments);
  if (entries.length === 0) return "No arguments";
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(", ");
}

export function ConductorWidget({
  messages,
  onSend,
  loading = false,
  initialMode = "collapsed",
  approvals = [],
  approvingId = null,
  onApprove,
  onReject,
  className,
}: ConductorWidgetProps) {
  const storeMode = useConductorStore((s) => s.mode);
  const setStoreMode = useConductorStore((s) => s.setMode);
  const storeTts = useConductorStore((s) => s.ttsEnabled);
  const setStoreTts = useConductorStore((s) => s.setTtsEnabled);

  const mode = storeMode;
  const setMode = setStoreMode;
  const ttsEnabled = storeTts;
  const setTtsEnabled = setStoreTts;

  useEffect(() => {
    if (initialMode !== "collapsed") {
      setStoreMode(initialMode);
    }
  }, [initialMode, setStoreMode]);

  const [input, setInput] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const speechInputRef = useRef<SpeechInputService | null>(null);
  const speechOutputRef = useRef<SpeechOutputService | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stopVoiceSession = useCallback(() => {
    speechInputRef.current?.cancel();
    speechOutputRef.current?.cancel();
    setVoiceState("idle");
  }, []);

  const pauseOrResumeVoice = useCallback(() => {
    if (voiceState === "speaking") {
      speechOutputRef.current?.pause();
      setVoiceState("paused");
    } else if (voiceState === "paused") {
      speechOutputRef.current?.resume();
      setVoiceState("speaking");
    } else if (voiceState === "listening") {
      speechInputRef.current?.stop();
      setVoiceState("idle");
    }
  }, [voiceState]);

  useEffect(() => {
    speechInputRef.current = new SpeechInputService({
      onStateChange: (st) => {
        setVoiceState(st);
      },
      onTranscript: (txt, isFinal) => {
        setInput(txt);
        if (isFinal && txt.trim()) {
          onSend(txt.trim());
          setInput("");
        }
      },
    });
    speechOutputRef.current = new SpeechOutputService();

    return () => {
      speechInputRef.current?.destroy();
      speechOutputRef.current?.destroy();
    };
  }, [onSend]);

  useEffect(() => {
    if (ttsEnabled && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "assistant" && !lastMsg.loading && lastMsg.content) {
        setVoiceState("speaking");
        speechOutputRef.current?.speak(lastMsg.content, () => {
          setVoiceState("idle");
        });
      }
    }
  }, [messages, ttsEnabled]);

  const toggleMic = useCallback(() => {
    if (
      voiceState === "listening" ||
      voiceState === "transcribing" ||
      voiceState === "speaking" ||
      voiceState === "paused"
    ) {
      stopVoiceSession();
    } else {
      speechOutputRef.current?.cancel();
      speechInputRef.current?.start();
    }
  }, [voiceState, stopVoiceSession]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (voiceState !== "idle") {
          stopVoiceSession();
          return;
        }
        if (mode !== "collapsed") {
          setMode("collapsed");
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "m" && mode !== "collapsed") {
        e.preventDefault();
        toggleMic();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mode, voiceState, toggleMic, stopVoiceSession, setMode]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    if (voiceState === "speaking" || voiceState === "listening") {
      stopVoiceSession();
    }
    onSend(trimmed);
    setInput("");
  };

  if (mode === "collapsed") {
    const hasApprovals = approvals.length > 0;

    // Map voice/loading state to ConductorButtonState
    const buttonState: ConductorButtonState = loading
      ? "thinking"
      : voiceState === "listening"
        ? "listening"
        : voiceState === "transcribing"
          ? "transcribing"
          : voiceState === "speaking"
            ? "speaking"
            : voiceState === "paused"
              ? "paused"
              : hasApprovals
                ? "approval"
                : "idle";

    return (
      <DynamicConductorButton
        state={buttonState}
        label="Open personal EAIP assistant"
        ariaExpanded={false}
        onClick={() => {
          setMode("docked");
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        badge={hasApprovals ? approvals.length : undefined}
      />
    );
  }

  const isExpanded = mode === "expanded";

  return (
    <div
      role="region"
      aria-label="Personal EAIP Assistant (Conductor)"
      className={cn(
        "border-border/80 bg-surface/95 dark:bg-surface/90 fixed z-50 flex flex-col rounded-2xl border shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-out",
        "motion-safe:animate-in motion-safe:fade-in-50 motion-safe:zoom-in-95 motion-reduce:animate-none",
        isExpanded
          ? "top-20 right-4 bottom-6 left-4 max-w-5xl sm:mx-auto"
          : "right-4 bottom-6 left-4 h-[520px] max-h-[85vh] max-w-[calc(100vw-2rem)] sm:right-6 sm:left-auto sm:max-h-[600px] sm:w-96",
        className,
      )}
    >
      {/* Header */}
      <div className="border-border bg-surface-secondary/50 flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-text-inverse flex h-7 w-7 items-center justify-center rounded-full">
            <PersonalAssistantMark size="sm" className="border-0 bg-transparent shadow-none" />
          </div>
          <div>
            <h3 className="text-text flex items-center gap-2 text-sm font-semibold">
              Your personal assistant
              <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-1.5 py-0.5 text-[9px] font-medium tracking-wide uppercase">
                Conductor
              </span>
              {voiceState !== "idle" && (
                <span className="bg-primary/20 text-primary animate-pulse rounded-full px-2 py-0.5 font-mono text-[10px]">
                  {voiceState}
                </span>
              )}
            </h3>
            <p className="text-text-muted flex items-center gap-1 text-[10px]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>EAIP context</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
            }}
            className={cn(
              "rounded-md p-1.5 text-xs font-medium transition-colors",
              ttsEnabled
                ? "bg-primary/20 text-primary"
                : "text-text-muted hover:text-text hover:bg-surface-tertiary",
            )}
            title={ttsEnabled ? "Voice Output Active" : "Enable Voice Output"}
            aria-label="Toggle Voice Output"
          >
            🔊
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(isExpanded ? "docked" : "expanded");
            }}
            className="text-text-muted hover:text-text hover:bg-surface-tertiary rounded-md p-1.5"
            aria-label={isExpanded ? "Dock window" : "Expand window"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isExpanded ? (
                <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
              ) : (
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              )}
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("collapsed");
            }}
            className="text-text-muted hover:text-text hover:bg-surface-tertiary rounded-md p-1.5"
            aria-label="Minimize Conductor"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="text-text-muted flex h-full flex-col items-center justify-center py-8 text-center">
            <PersonalAssistantMark
              size="lg"
              state={loading ? "thinking" : voiceState}
              className="mb-3"
            />
            <p className="text-text text-sm font-medium">
              Hi, I&apos;m your personal EAIP assistant.
            </p>
            <p className="mt-1 max-w-[18rem] text-xs">
              Ask about EAIP, investigate an issue, or help operate the platform.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onSend("give me the morning briefing");
                }}
                className="border-border bg-surface text-text-secondary hover:bg-surface-tertiary rounded-md border px-3 py-1.5 text-xs"
              >
                📋 System Briefing
              </button>
              <button
                type="button"
                onClick={() => {
                  onSend("show system twin overview");
                }}
                className="border-border bg-surface text-text-secondary hover:bg-surface-tertiary rounded-md border px-3 py-1.5 text-xs"
              >
                🌐 System Twin
              </button>
              <button
                type="button"
                onClick={() => {
                  onSend("What do you remember about me?");
                }}
                className="border-border bg-surface text-text-secondary hover:bg-surface-tertiary rounded-md border px-3 py-1.5 text-xs"
              >
                ✦ My memory
              </button>
            </div>
          </div>
        )}{" "}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}
          >
            {/* Modern Tool Events Activity Badges */}
            {msg.toolEvents && msg.toolEvents.length > 0 && (
              <div className="mb-2 flex w-full flex-col gap-1.5">
                {msg.toolEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="border-border/40 bg-surface-tertiary/50 text-text-secondary flex items-center gap-2.5 rounded-lg border px-3 py-1.5 text-[11px] shadow-sm transition-all"
                  >
                    {event.status === "running" ? (
                      <Spinner size="sm" className="text-primary h-3 w-3" />
                    ) : event.status === "executed" ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-success"
                        aria-hidden="true"
                      >
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : event.status === "failed" ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-danger"
                        aria-hidden="true"
                      >
                        <path
                          d="M18 6L6 18M6 6l12 12"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="text-primary font-mono text-[10px] font-bold">◇</span>
                    )}
                    <span className="font-mono font-medium">{event.tool_name}</span>
                    {event.summary && (
                      <span className="text-text-muted ml-1 truncate opacity-80">
                        {event.summary}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm shadow-sm",
                msg.role === "user"
                  ? "bg-primary text-text-inverse"
                  : "bg-surface-secondary border-border text-text border",
              )}
            >
              {msg.loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-text-muted text-xs">Conductor is thinking...</span>
                </div>
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      {approvals.length > 0 && (
        <div className="border-border bg-surface-secondary/60 max-h-44 space-y-2 overflow-y-auto border-t px-3 py-2">
          <p className="text-warning flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
            <span className="bg-warning inline-block h-1.5 w-1.5 rounded-full" />
            {approvals.length} action{approvals.length > 1 ? "s" : ""} awaiting approval
          </p>
          {approvals.map((approval) => (
            <div key={approval.id} className="border-border bg-surface rounded-md border p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-primary font-mono text-xs font-bold">
                  {approval.tool_name}
                </span>
                {approval.risk && (
                  <span className="border-warning/30 bg-warning-subtle text-warning rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                    {approval.risk}
                  </span>
                )}
              </div>
              <p className="text-text-secondary mt-1 text-[11px] leading-relaxed">
                {approvalSummary(approval)}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onApprove?.(approval.id);
                  }}
                  disabled={approvingId !== null}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onReject?.(approval.id);
                  }}
                  disabled={approvingId !== null}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Voice Active Control Banner */}
      {voiceState !== "idle" && (
        <div className="border-border/80 bg-surface-secondary/80 flex items-center justify-between gap-3 border-t px-3.5 py-2 backdrop-blur-md transition-all">
          <div className="flex items-center gap-2.5">
            <div className="flex h-4 items-center gap-0.5">
              <span className="bg-primary h-3 w-1 animate-[pulse_0.6s_ease-in-out_infinite] rounded-full" />
              <span className="h-4 w-1 animate-[pulse_0.4s_ease-in-out_infinite] rounded-full bg-sky-400" />
              <span className="bg-primary h-2 w-1 animate-[pulse_0.7s_ease-in-out_infinite] rounded-full" />
              <span className="h-3.5 w-1 animate-[pulse_0.5s_ease-in-out_infinite] rounded-full bg-violet-400" />
            </div>
            <span className="text-text text-xs font-medium">
              {voiceState === "listening"
                ? "Listening to your voice..."
                : voiceState === "transcribing"
                  ? "Transcribing voice..."
                  : voiceState === "speaking"
                    ? "Conductor is speaking..."
                    : voiceState === "paused"
                      ? "Voice paused"
                      : "Voice active"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {voiceState === "speaking" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={pauseOrResumeVoice}
                className="text-text-secondary hover:text-text h-7 px-2 text-xs"
              >
                Pause
              </Button>
            )}
            {voiceState === "paused" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={pauseOrResumeVoice}
                className="text-text-secondary hover:text-text h-7 px-2 text-xs"
              >
                Resume
              </Button>
            )}
            <button
              type="button"
              onClick={stopVoiceSession}
              className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-500 transition-colors hover:bg-rose-500/25"
              aria-label="Stop Voice Session"
            >
              <span className="h-2 w-2 rounded-xs bg-rose-500" />
              Stop Voice
            </button>
          </div>
        </div>
      )}

      {/* Input Footer */}
      <div className="border-border bg-surface border-t p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border transition-all",
              voiceState === "listening"
                ? "animate-pulse border-rose-500 bg-rose-500/20 text-rose-500"
                : "border-border bg-surface-secondary text-text-secondary hover:bg-surface-tertiary",
            )}
            aria-label="Push to Talk"
            title="Push to Talk (Mic)"
          >
            🎤
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={voiceState === "listening" ? "Listening..." : "Ask Conductor..."}
            disabled={loading}
            className="border-border bg-surface-secondary text-text focus:border-primary placeholder:text-text-muted flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none"
          />
          <Button size="sm" onClick={handleSubmit} disabled={!input.trim() || loading}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface SuggestionChipProps {
  items: { id: string; label: string }[];
  onSelect: (id: string) => void;
  className?: string;
}

export function SuggestionChips({ items, onSelect, className }: SuggestionChipProps) {
  if (items.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onSelect(item.id);
          }}
          className="border-border bg-surface text-text-secondary transition-smooth hover:bg-surface-tertiary hover:text-text hover:border-border-strong rounded-full border px-3 py-1 text-xs"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export interface ModelSelectorProps {
  models: { id: string; label: string; description?: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function ModelSelector({ models, value, onChange, className }: ModelSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {models.map((model) => {
        const active = model.id === value;
        return (
          <button
            key={model.id}
            type="button"
            onClick={() => {
              onChange(model.id);
            }}
            className={cn(
              "rounded-button transition-smooth border px-3 py-1.5 text-xs font-medium",
              active
                ? "bg-primary text-text-inverse border-primary shadow-sm"
                : "bg-surface text-text-secondary border-border hover:bg-surface-tertiary hover:text-text",
            )}
            aria-pressed={active}
          >
            {model.label}
          </button>
        );
      })}
    </div>
  );
}

export function SystemTwinGraph({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-border/40 bg-surface-secondary/40 relative flex items-center justify-center overflow-hidden rounded-xl border p-6 backdrop-blur-sm",
        className,
      )}
    >
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Central Nucleus */}
        <div className="bg-primary/20 border-primary/40 relative flex h-16 w-16 animate-pulse items-center justify-center rounded-full border shadow-lg">
          <div className="bg-primary text-text-inverse flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold">
            EAIP
          </div>
        </div>
        <span className="text-text font-mono text-xs font-semibold tracking-wider uppercase">
          System Twin Nucleus
        </span>

        {/* Surrounding Nodes */}
        <div className="flex max-w-sm flex-wrap items-center justify-center gap-2">
          {["Agents", "Workflows", "Missions", "Automations", "Knowledge", "Health"].map((node) => (
            <div
              key={node}
              className="border-border bg-surface text-text-secondary flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium shadow-xs"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
