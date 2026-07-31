import { useState, useRef, useEffect } from "react";
import { cn } from "@eaip/core";
import { Button, Spinner, Avatar } from "@eaip/ui-primitives";
import { Tooltip } from "@eaip/ui-foundation";

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