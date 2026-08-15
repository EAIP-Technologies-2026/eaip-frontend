"use client";

import { cn } from "@eaip/core";
import type { EvidenceType, InvestigationEvidence } from "./investigation";

const EVIDENCE_BADGES: Record<
  EvidenceType,
  { label: string; color: string }
> = {
  observed: {
    label: "OBSERVED",
    color: "bg-success/20 text-success border-success/30",
  },
  inferred: {
    label: "INFERRED",
    color: "bg-warning/20 text-warning border-warning/30",
  },
  recommended: {
    label: "RECOMMENDED",
    color: "bg-primary/20 text-primary border-primary/30",
  },
};

export interface EvidenceListProps {
  evidence: InvestigationEvidence[];
  className?: string;
}

export function EvidenceList({
  evidence,
  className,
}: EvidenceListProps) {
  if (evidence.length === 0) {
    return (
      <div
        className={cn(
          "text-xs text-text-muted text-center py-4",
          className,
        )}
      >
        No evidence collected yet.
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label="Investigation evidence"
      className={cn("space-y-2", className)}
    >
      {evidence.map((ev) => {
        const badge = EVIDENCE_BADGES[ev.evidence_type];
        return (
          <div
            key={ev.id}
            role="listitem"
            className={cn(
              "rounded-lg border bg-surface/80 px-3 py-2",
              ev.stale
                ? "border-warning/40 opacity-75"
                : "border-border",
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={cn(
                  "rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                  badge.color,
                )}
              >
                {badge.label}
              </span>
              <span className="text-[10px] text-text-muted font-mono">
                {ev.source}
              </span>
              {ev.source_tool && (
                <span className="text-[10px] text-text-muted font-mono">
                  {ev.source_tool}
                </span>
              )}
              <span className="text-[10px] text-text-muted">
                {Math.round(ev.confidence * 100)}% conf
              </span>
              {ev.stale && (
                <span className="text-[10px] text-warning font-medium">
                  STALE
                </span>
              )}
            </div>
            <p className="text-xs text-text leading-relaxed">
              {ev.content}
            </p>
            {ev.stale && ev.stale_reason && (
              <p className="text-[10px] text-warning mt-1">
                {ev.stale_reason}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
