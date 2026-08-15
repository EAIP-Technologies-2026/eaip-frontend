"use client";

import { cn } from "@eaip/core";
import type {
  OrchestrationPlanSummary,
  PlanStatus,
  PlanRisk,
} from "./orchestration";

const STATUS_LABELS: Record<PlanStatus, string> = {
  draft: "Draft",
  ready: "Ready",
  awaiting_approval: "Awaiting Approval",
  approved: "Approved",
  running: "Running",
  paused: "Paused",
  blocked: "Blocked",
  failed: "Failed",
  cancelled: "Cancelled",
  completed: "Completed",
  partial_success: "Partial Success",
  rolled_back: "Rolled Back",
};

const STATUS_COLORS: Record<PlanStatus, string> = {
  draft: "bg-neutral-200 text-neutral-700",
  ready: "bg-primary/20 text-primary",
  awaiting_approval: "bg-warning/20 text-warning",
  approved: "bg-success/20 text-success",
  running: "bg-primary/20 text-primary animate-pulse",
  paused: "bg-warning/20 text-warning",
  blocked: "bg-danger/20 text-danger",
  failed: "bg-danger/20 text-danger",
  cancelled: "bg-neutral-200 text-neutral-500",
  completed: "bg-success/20 text-success",
  partial_success: "bg-warning/20 text-warning",
  rolled_back: "bg-neutral-200 text-neutral-500",
};

const RISK_COLORS: Record<PlanRisk, string> = {
  informational: "bg-neutral-200 text-neutral-600",
  action: "bg-warning/20 text-warning",
  destructive: "bg-danger/20 text-danger",
};

export interface OrchestrationPlanCardProps {
  plan: OrchestrationPlanSummary;
  onSelect?: (id: string) => void;
  onApprove?: (id: string) => void;
  onExecute?: (id: string) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  className?: string;
}

export function OrchestrationPlanCard({
  plan,
  onSelect,
  onApprove,
  onExecute,
  onPause,
  onResume,
  onCancel,
  className,
}: OrchestrationPlanCardProps) {
  const completedSteps = plan.steps.filter(
    (s) => s.status === "completed",
  ).length;
  const failedSteps = plan.steps.filter(
    (s) => s.status === "failed",
  ).length;
  const totalSteps = plan.steps.length;
  const progress =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div
      role="article"
      aria-label={`Plan: ${plan.objective}`}
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
            onClick={() => { onSelect?.(plan.id); }}
            className="text-sm font-semibold text-text hover:text-primary transition-colors text-left truncate block w-full"
          >
            {plan.objective}
          </button>
          {plan.description && (
            <p className="text-xs text-text-muted mt-0.5 line-clamp-2">
              {plan.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              STATUS_COLORS[plan.status],
            )}
          >
            {STATUS_LABELS[plan.status]}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              RISK_COLORS[plan.risk],
            )}
          >
            {plan.risk}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
          <span>
            {String(completedSteps)}/{String(totalSteps)} steps
          </span>
          <span>
            {String(plan.tool_calls_used)}/
            {String(plan.budget.max_tool_calls)} tool calls
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-tertiary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${String(progress)}%` }}
            role="progressbar"
            aria-valuenow={completedSteps}
            aria-valuemin={0}
            aria-valuemax={totalSteps}
          />
        </div>
      </div>

      {/* Step preview */}
      <div className="mb-2 space-y-0.5">
        {plan.steps.slice(0, 4).map((step) => (
          <div
            key={step.id}
            className="flex items-center gap-2 text-[11px]"
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full shrink-0",
                step.status === "completed"
                  ? "bg-success"
                  : step.status === "failed"
                    ? "bg-danger"
                    : step.status === "running"
                      ? "bg-primary animate-pulse"
                      : "bg-neutral-300",
              )}
            />
            <span className="text-text-secondary truncate">
              {step.description}
            </span>
          </div>
        ))}
        {plan.steps.length > 4 && (
          <p className="text-[10px] text-text-muted">
            +{String(plan.steps.length - 4)} more steps
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[11px] text-text-secondary mb-2">
        {failedSteps > 0 && (
          <span className="text-danger">
            {String(failedSteps)} failed
          </span>
        )}
        {plan.retries_used > 0 && (
          <span>{String(plan.retries_used)} retries</span>
        )}
        {plan.rollbacks_used > 0 && (
          <span>{String(plan.rollbacks_used)} rollbacks</span>
        )}
        {plan.approval_required && (
          <span className="text-warning">Approval required</span>
        )}
      </div>

      {/* Result */}
      {plan.result_summary && (
        <p className="text-xs text-text-muted mb-2">
          {plan.result_summary}
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
        {plan.status === "awaiting_approval" && onApprove && (
          <PlanButton
            onClick={() => { onApprove(plan.id); }}
            variant="primary"
          >
            Approve
          </PlanButton>
        )}
        {(plan.status === "approved" ||
          plan.status === "paused") &&
          onExecute && (
            <PlanButton onClick={() => { onExecute(plan.id); }}>
              Execute
            </PlanButton>
          )}
        {plan.status === "running" && onPause && (
          <PlanButton onClick={() => { onPause(plan.id); }}>
            Pause
          </PlanButton>
        )}
        {plan.status === "paused" && onResume && (
          <PlanButton onClick={() => { onResume(plan.id); }}>
            Resume
          </PlanButton>
        )}
        {!["completed", "cancelled", "rolled_back"].includes(
          plan.status,
        ) &&
          onCancel && (
            <PlanButton
              onClick={() => { onCancel(plan.id); }}
              variant="danger"
            >
              Cancel
            </PlanButton>
          )}
        <span className="flex-1" />
        <span className="text-[10px] text-text-muted font-mono">
          {new Date(plan.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function PlanButton({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
        variant === "primary"
          ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
          : variant === "danger"
            ? "border-danger/30 bg-danger/10 text-danger hover:bg-danger/20"
            : "border-border bg-surface text-text-secondary hover:bg-surface-tertiary hover:text-text",
      )}
    >
      {children}
    </button>
  );
}
