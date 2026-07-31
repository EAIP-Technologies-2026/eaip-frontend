import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";
import { Button } from "@eaip/ui-primitives";

export interface ContextItem {
  id: string;
  label: string;
  type?: "document" | "knowledge" | "memory" | "conversation";
}

export interface AIContextBarProps extends HTMLAttributes<HTMLDivElement> {
  items: ContextItem[];
  onRemove?: (id: string) => void;
  onClear?: () => void;
  className?: string;
}

const typeIcons: Record<string, ReactNode> = {
  document: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  knowledge: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  memory: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 3.5 2 6.5 4 9s3 4 3 4 1-1.5 3-4 4-5.5 4-9a7 7 0 0 0-7-7z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="9" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  conversation: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function AIContextBar({ items, onRemove, onClear, className, ...props }: AIContextBarProps) {
  if (items.length === 0) return null;
  return (
    <div className={cn("flex items-center gap-2 rounded-card border border-border bg-surface-secondary px-3 py-2", className)} {...props}>
      <span className="text-xs font-medium text-text-muted shrink-0">Context:</span>
      <div className="flex flex-wrap gap-1.5 flex-1">
        {items.map((item) => (
          <span key={item.id} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs text-text border border-border">
            {typeIcons[item.type ?? "document"]}
            {item.label}
            {onRemove && (
              <button
                type="button"
                onClick={() => { onRemove(item.id); }}
                className="ml-0.5 rounded-full p-0.5 text-text-muted hover:text-text"
                aria-label={`Remove ${item.label}`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </span>
        ))}
      </div>
      {onClear && (
        <Button type="button" variant="ghost" size="xs" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  );
}