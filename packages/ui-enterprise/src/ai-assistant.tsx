import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@eaip/core";
import { Button, Spinner, Avatar } from "@eaip/ui-primitives";
import { Tooltip } from "@eaip/ui-foundation";
import { useConductorStore } from "@eaip/state";
import { SpeechInputService, SpeechOutputService, type VoiceState } from "./speech-services";
import { PersonalAssistantMark } from "./personal-assistant-mark";


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

export function AIChatPanel({ messages, onSend, loading = false, placeholder = "Ask anything...", title = "AI Assistant", className }: AIChatPanelProps) {
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
    <div className={cn("flex flex-col rounded-card border border-border bg-surface overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-text-inverse">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-text">{title}</span>
        </div>
        <Tooltip content="New conversation">
          <Button type="button" variant="ghost" size="sm" iconOnly>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Button>
        </Tooltip>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 p-4 min-h-[300px] max-h-[500px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text">How can I help you today?</p>
            <p className="text-xs text-text-muted mt-1">Ask a question or describe a task</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary mt-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-card px-3 py-2 text-sm",
                msg.role === "user"
                  ? "bg-primary text-text-inverse"
                  : "bg-surface-secondary text-text border border-border",
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
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-text-muted mt-1">
                <Avatar name="You" size="sm" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
              placeholder={placeholder}
              disabled={loading}
              className="block w-full rounded-input border bg-surface px-3 py-2.5 pr-10 text-sm text-text shadow-sm transition-smooth border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-text-muted disabled:opacity-50"
              aria-label="Chat input"
            />
          </div>
          <Button type="button" size="sm" onClick={handleSubmit} disabled={!input.trim() || loading}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

  const mode = storeMode || initialMode;
  const setMode = setStoreMode;
  const ttsEnabled = storeTts;
  const setTtsEnabled = setStoreTts;

  useEffect(() => {
    if (initialMode && initialMode !== "collapsed") {
      setStoreMode(initialMode);
    }
  }, [initialMode, setStoreMode]);

  const [input, setInput] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const speechInputRef = useRef<SpeechInputService | null>(null);
  const speechOutputRef = useRef<SpeechOutputService | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (voiceState === "listening") {
      speechInputRef.current?.stop();
    } else {
      speechInputRef.current?.start();
    }
  }, [voiceState]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, mode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mode !== "collapsed") {
        setMode("collapsed");
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
  }, [mode, voiceState, toggleMic]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput("");
  };


  if (mode === "collapsed") {
    const hasApprovals = approvals.length > 0;
    return (
      <div data-tour="conductor" className={cn("fixed bottom-6 right-6 z-50", className)}>
        <button
          type="button"
          onClick={() => {
            setMode("docked");
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className={cn(
            "group relative flex items-center gap-2.5 rounded-full px-3.5 py-2",
            "bg-surface/90 dark:bg-surface/85 backdrop-blur-xl",
            "border border-border/80 dark:border-white/15",
            "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(56,189,248,0.15)]",
            "dark:shadow-[0_8px_32px_rgba(0,0,0,0.45),0_2px_12px_rgba(56,189,248,0.25)]",
            "text-text transition-all duration-300 ease-out",
            "hover:scale-[1.03] hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(56,189,248,0.25)]",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface",
            "motion-reduce:hover:scale-100 motion-reduce:transition-none",
            hasApprovals && "ring-2 ring-warning/60 animate-pulse",
          )}
          aria-label="Open personal EAIP assistant"
          aria-expanded={false}
          aria-haspopup="dialog"
        >
          {/* Ambient Glow Aura */}
          <span
            className="absolute -inset-0.5 -z-10 rounded-full bg-gradient-to-r from-primary/30 via-primary-subtle/40 to-primary/30 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100 motion-reduce:hidden"
            aria-hidden="true"
          />

          {/* Mark / Icon */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none">
            <PersonalAssistantMark
              size="sm"
              state={loading ? "thinking" : voiceState !== "idle" ? voiceState : hasApprovals ? "approval" : "idle"}
              className="border-0 bg-transparent shadow-none"
            />
          </div>

          {/* Assistant Info */}
          <div className="flex flex-col items-start pr-1 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold tracking-tight text-text">Conductor</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-pulse motion-reduce:animate-none" />
            </div>
            <span className="text-[10px] text-text-muted font-medium">Enterprise Assistant</span>
          </div>

          {/* Pending approval badge if any */}
          {hasApprovals && (
            <span className="flex h-5 items-center justify-center rounded-full bg-warning px-1.5 text-[10px] font-bold text-black shadow-sm">
              {String(approvals.length)}
            </span>
          )}

          {/* Shortcut hint */}
          <kbd className="hidden sm:inline-flex items-center rounded border border-border/80 bg-surface-tertiary/80 px-1.5 py-0.5 text-[9px] font-mono text-text-muted">
            ⌘M
          </kbd>
        </button>
      </div>
    );
  }

  const isExpanded = mode === "expanded";

  return (
    <div
      role="region"
      aria-label="Personal EAIP Assistant (Conductor)"
      aria-expanded={true}
      className={cn(
        "fixed z-50 flex flex-col rounded-2xl border border-border/80 bg-surface/95 dark:bg-surface/90 backdrop-blur-2xl shadow-2xl transition-all duration-300 ease-out",
        "motion-safe:animate-in motion-safe:fade-in-50 motion-safe:zoom-in-95 motion-reduce:animate-none",
        isExpanded
          ? "bottom-6 right-4 left-4 top-20 max-w-5xl sm:mx-auto"
          : "bottom-6 right-4 left-4 sm:left-auto sm:right-6 sm:w-96 max-h-[85vh] sm:max-h-[600px] h-[520px] max-w-[calc(100vw-2rem)]",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface-secondary/50">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-text-inverse">
            <PersonalAssistantMark size="sm" className="border-0 bg-transparent shadow-none" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text flex items-center gap-2">
              Your personal assistant
              <span className="rounded-full border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-primary">
                Conductor
              </span>
              {voiceState !== "idle" && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-mono text-primary animate-pulse">
                  {voiceState}
                </span>
              )}
            </h3>
            <p className="text-[10px] text-text-muted flex items-center gap-1">
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
              "p-1.5 rounded-md text-xs font-medium transition-colors",
              ttsEnabled ? "bg-primary/20 text-primary" : "text-text-muted hover:text-text hover:bg-surface-tertiary"
            )}
            title={ttsEnabled ? "Voice Output Active" : "Enable Voice Output"}
            aria-label="Toggle Voice Output"
          >
            🔊
          </button>
          <button
            type="button"
            onClick={() => { setMode(isExpanded ? "docked" : "expanded"); }}
            className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-tertiary"
            aria-label={isExpanded ? "Dock window" : "Expand window"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isExpanded ? (
                <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
              ) : (
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              )}
            </svg>
          </button>
          <button
            type="button"
            onClick={() => { setMode("collapsed"); }}
            className="p-1.5 text-text-muted hover:text-text rounded-md hover:bg-surface-tertiary"
            aria-label="Minimize Conductor"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-text-muted">
            <PersonalAssistantMark size="lg" state={loading ? "thinking" : voiceState} className="mb-3" />
            <p className="text-sm font-medium text-text">Hi, I&apos;m your personal EAIP assistant.</p>
            <p className="text-xs mt-1 max-w-[18rem]">Ask about EAIP, investigate an issue, or help operate the platform.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onSend("give me the morning briefing");
                }}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary"
              >
                📋 System Briefing
              </button>
              <button
                type="button"
                onClick={() => {
                  onSend("show system twin overview");
                }}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary"
              >
                🌐 System Twin
              </button>
              <button
                type="button"
                onClick={() => { onSend("What do you remember about me?"); }}
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-text-secondary hover:bg-surface-tertiary"
              >
                ✦ My memory
              </button>
            </div>
          </div>
        )}        {messages.map((msg) => (

          <div key={msg.id} className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
            {/* Tool Events Activity Badges */}
            {msg.toolEvents?.map((event, idx) => (
              <div
                key={idx}
                className="mb-1 flex items-center gap-2 rounded-lg border border-border/60 bg-surface-secondary/80 px-2.5 py-1 text-xs text-text-secondary"
              >
                <span className="text-primary font-mono font-bold">◇</span>
                <span className="font-medium">{event.tool_name}</span>
                <span className="text-[10px] opacity-75">{event.status}</span>
              </div>
            ))}

            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm shadow-sm",
                msg.role === "user"
                  ? "bg-primary text-text-inverse"
                  : "bg-surface-secondary border border-border text-text",
              )}
            >
              {msg.loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span className="text-xs text-text-muted">Conductor is thinking...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      {approvals.length > 0 && (
        <div className="border-t border-border bg-surface-secondary/60 px-3 py-2 space-y-2 max-h-44 overflow-y-auto">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-warning">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-warning" />
            {approvals.length} action{approvals.length > 1 ? "s" : ""} awaiting approval
          </p>
          {approvals.map((approval) => (
            <div key={approval.id} className="rounded-md border border-border bg-surface p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-primary">{approval.tool_name}</span>
                {approval.risk && (
                  <span className="rounded-full border border-warning/30 bg-warning-subtle px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">
                    {approval.risk}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                {approvalSummary(approval)}
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => { onApprove?.(approval.id); }}
                  disabled={approvingId !== null}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => { onReject?.(approval.id); }}
                  disabled={approvingId !== null}
                >
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Footer */}
      <div className="border-t border-border p-3 bg-surface">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMic}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border transition-all",
              voiceState === "listening"
                ? "bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse"
                : "border-border bg-surface-secondary text-text-secondary hover:bg-surface-tertiary"
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
            onChange={(e) => { setInput(e.target.value); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={voiceState === "listening" ? "Listening..." : "Ask Conductor..."}
            disabled={loading}
            className="flex-1 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-text focus:border-primary focus:outline-none placeholder:text-text-muted"
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
          onClick={() => { onSelect(item.id); }}
          className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary transition-smooth hover:bg-surface-tertiary hover:text-text hover:border-border-strong"
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
            onClick={() => { onChange(model.id); }}
            className={cn(
              "rounded-button px-3 py-1.5 text-xs font-medium transition-smooth border",
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
    <div className={cn("relative flex items-center justify-center p-6 border border-border/40 rounded-xl bg-surface-secondary/40 backdrop-blur-sm overflow-hidden", className)}>
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Central Nucleus */}
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 border border-primary/40 shadow-lg animate-pulse">
          <div className="h-8 w-8 rounded-full bg-primary text-text-inverse flex items-center justify-center font-mono font-bold text-xs">
            EAIP
          </div>
        </div>
        <span className="text-xs font-mono font-semibold tracking-wider text-text uppercase">System Twin Nucleus</span>
        
        {/* Surrounding Nodes */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
          {["Agents", "Workflows", "Missions", "Automations", "Knowledge", "Health"].map((node) => (
            <div key={node} className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-medium text-text-secondary shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {node}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
