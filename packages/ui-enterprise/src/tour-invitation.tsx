"use client";

import { cn } from "@eaip/core";

export interface TourInvitationProps {
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
  onClose: () => void;
  className?: string;
}

export function TourInvitation({
  visible,
  onAccept,
  onDismiss,
  onClose,
  className,
}: TourInvitationProps) {
  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Guided tour invitation"
      aria-live="polite"
      className={cn(
        "mx-auto max-w-xl rounded-xl border border-border bg-surface/95 backdrop-blur-md px-4 py-3 shadow-lg",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text">
            Want a guided tour of this next-generation platform?
          </p>
          <p className="mt-0.5 text-xs text-text-muted leading-relaxed">
            I&apos;ll walk you through the major capabilities and show you how
            everything works.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-surface-tertiary transition-colors"
          aria-label="Close tour invitation"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={onAccept}
          className="rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-text-inverse shadow-sm transition-all hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          Yes, show me
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text-secondary transition-all hover:bg-surface-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
