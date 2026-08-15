"use client";

import { cn } from "@eaip/core";
import type {
  InvestigationSummary,
  InvestigationStatus,
  InvestigationPriority,
} from "./investigation";

const STATUS_LABELS: Record<InvestigationStatus, string> = {
  draft: "Draft",
  active: "Active",
  paused: "Paused",
  waiting: "Waiting",
  resolved: "Resolved",
  archived: "Archived",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<InvestigationStatus, string> = {
  draft: "bg-neutral-200 text-neutral-700",
  active: "bg-primary/20 text-primary",
  paused: "bg-warning/20 text-warning",
  waiting: "bg-warning/20 text-warning",
  resolved: "bg-success/20 text-success",
  archived: "bg-neutral-200 text-neutral-500",
  cancelled: "bg-danger/20 text-danger",
};

const PRIORITY_COLORS: Record<InvestigationPriority, string> = {
  low: "bg-neutral-200 text-neutral-600",
  medium: "bg-primary/10 text-primary",
  high: "bg-warning/20 text-warning",
  critical: "bg-danger/20 text-danger",
};

export interface InvestigationCardProps {
  investigation: InvestigationSummary;
  onSelect?: (id: string) => void;
  onResume?: (id: string) => void;
  onPause?: (id: string) => void;
  onResolve?: (id: string) => void;
  className?: string;
}

export function InvestigationCard({
  investigation: inv,
  onSelect,
  onResume,
  onPause,
  onResolve,
  className,
}: InvestigationCardProps) {
  const isActive = inv.status === "active";
  const isPaused = inv.status === "paused";
  const isResolvable = isActive || isPaused;

  return (
    <div
      role="article"
      aria-label={`Investigation: ${inv.title}`}
      className={cn(
        "rounded-xl border border-border bg-surface/95 backdrop-blur-sm px-4 py-3 shadow-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onSelect?.(inv.id)}
            className="text-sm font-semibold text-text hover:text-primary transition-colors text-left truncate block w-full"
          >
            {inv.title}
          </button>
          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
            {inv.objective}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              STATUS_COLORS[inv.status],
            )}
          >
            {STATUS_LABELS[inv.status]}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              PRIORITY_COLORS[inv.priority],
            )}
          >
            {inv.priority}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
          <span>Reasoning steps</span>
          <span>
            {String(inv.reasoning_steps_used)}/
            {String(inv.max_reasoning_steps)}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-surface-tertiary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{
              width: `${String(
                Math.min(
                  100,
                  (inv.reasoning_steps_used /
                    inv.max_reasoning_steps) *
                    100,
                ),
              )}%`,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[11px] text-text-secondary mb-2">
        <span>{String(inv.evidence_count)} evidence</span>
        <span>{String(inv.hypothesis_count)} hypotheses</span>
        {inv.findings.length > 0 && (
          <span>{String(inv.findings.length)} findings</span>
        )}
        {inv.unresolved_questions.length > 0 && (
          <span className="text-warning">
            {String(inv.unresolved_questions.length)} open
          </span>
        )}
      </div>

      {/* Summary preview */}
      {inv.summary && (
        <p className="text-xs text-text-muted mb-2 line-clamp-2">
          {inv.summary}
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
        {isActive && onPause && (
          <InvButton onClick={() => { onPause(inv.id); }}>
            Pause
          </InvButton>
        )}
        {isPaused && onResume && (
          <InvButton onClick={() => { onResume(inv.id); }}>
            Resume
          </InvButton>
        )}
        {isResolvable && onResolve && (
          <InvButton onClick={() => { onResolve(inv.id); }}>
            Resolve
          </InvButton>
        )}
        <span className="flex-1" />
        <span className="text-[10px] text-text-muted font-mono">
          {new Date(inv.last_activity_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function InvButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-surface-tertiary hover:text-text transition-colors"
    >
      {children}
    </button>
  );
}
