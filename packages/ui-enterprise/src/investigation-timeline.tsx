"use client";

import { cn } from "@eaip/core";
import type { TimelineEvent } from "./investigation";

const EVENT_ICONS: Record<string, string> = {
  created: "created",
  started: "started",
  paused: "paused",
  resumed: "resumed",
  resolved: "resolved",
  archived: "archived",
  cancelled: "cancelled",
  evidence_added: "evidence",
  hypothesis_added: "hypothesis",
  findings_updated: "findings",
};

export interface InvestigationTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function InvestigationTimeline({
  events,
  className,
}: InvestigationTimelineProps) {
  if (events.length === 0) {
    return (
      <div
        className={cn(
          "text-xs text-text-muted text-center py-4",
          className,
        )}
      >
        No timeline events yet.
      </div>
    );
  }

  return (
    <div
      role="list"
      aria-label="Investigation timeline"
      className={cn("space-y-2", className)}
    >
      {events.map((event) => (
        <div
          key={event.id}
          role="listitem"
          className="flex items-start gap-3 group"
        >
          {/* Timeline dot */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-2 w-2 rounded-full mt-1.5 shrink-0",
                event.event_type === "evidence_added"
                  ? "bg-primary"
                  : event.event_type === "hypothesis_added"
                    ? "bg-warning"
                    : event.event_type === "resolved"
                      ? "bg-success"
                      : "bg-neutral-400",
              )}
            />
            <div className="w-px h-full bg-border/50 min-h-[16px]" />
          </div>

          {/* Event content */}
          <div className="flex-1 min-w-0 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-text-muted">
                {formatTime(event.timestamp)}
              </span>
              <span className="rounded-full bg-surface-tertiary px-1.5 py-0.5 text-[9px] font-medium text-text-muted uppercase tracking-wide">
                {EVENT_ICONS[event.event_type] ?? event.event_type}
              </span>
            </div>
            <p className="text-xs text-text mt-0.5 leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
