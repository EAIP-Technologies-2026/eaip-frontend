"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@eaip/core";
import { useReducedMotion } from "@eaip/motion";
import type { TourState, TourStep } from "./tour";

export interface TourModeBarProps {
  active: boolean;
  state: TourState;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  onPause: () => void;
  onResume: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onStop: () => void;
  onSkip: () => void;
  className?: string;
}

export function TourModeBar({
  active,
  state,
  currentStep,
  currentStepIndex,
  totalSteps,
  onPause,
  onResume,
  onPrevious,
  onNext,
  onStop,
  onSkip,
  className,
}: TourModeBarProps) {
  if (!active) return null;

  const isPaused = state === "paused";
  const isCompleted = state === "completed" || state === "cancelled";
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0;

  return (
    <div
      role="region"
      aria-label="Guided tour controls"
      className={cn(
        "rounded-xl border border-primary/30 bg-surface/90 dark:bg-surface/80 backdrop-blur-md px-4 py-3 shadow-lg transition-all duration-300",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-text-inverse text-[10px] font-bold shadow-sm">
            {currentStepIndex + 1}
          </span>
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            EAIP Guided Tour
          </span>
          {isPaused && (
            <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-medium text-warning">
              Paused
            </span>
          )}
        </div>
        <span className="text-[10px] text-text-muted font-mono">
          {currentStepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2 h-1.5 w-full rounded-full bg-surface-tertiary overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-400 to-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${String(progress)}%` }}
          role="progressbar"
          aria-valuenow={currentStepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Tour step ${String(currentStepIndex + 1)} of ${String(totalSteps)}`}
        />
      </div>

      {/* Current step info */}
      {currentStep && !isCompleted && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-text">{currentStep.title}</p>
          {currentStep.demo_description && (
            <p className="text-[11px] text-text-muted mt-0.5">
              {currentStep.demo_description}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      {!isCompleted && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {isPaused ? (
            <TourButton onClick={onResume} aria-label="Resume tour">
              <PlayIcon /> Resume
            </TourButton>
          ) : (
            <TourButton onClick={onPause} aria-label="Pause tour">
              <PauseIcon /> Pause
            </TourButton>
          )}
          <TourButton onClick={onSkip} aria-label="Skip this step">
            <SkipIcon /> Skip
          </TourButton>
          <TourButton onClick={onPrevious} aria-label="Previous step" disabled={currentStepIndex === 0}>
            <PreviousIcon /> Previous
          </TourButton>
          <TourButton onClick={onNext} aria-label="Next step">
            <NextIcon /> Next
          </TourButton>
          <TourButton onClick={onStop} variant="danger" aria-label="Stop tour">
            <StopIcon /> Stop Tour
          </TourButton>
        </div>
      )}
    </div>
  );
}

export interface TourSpotlightProps {
  active: boolean;
  state: TourState;
  currentStep: TourStep | null;
  currentStepIndex: number;
  totalSteps: number;
  narration?: string;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onStop: () => void;
}

export function TourSpotlight({
  active,
  currentStep,
  currentStepIndex,
  totalSteps,
  narration,
  onNext,
  onPrevious,
  onSkip,
  onStop,
}: TourSpotlightProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const reduced = useReducedMotion();
  const observerRef = useRef<ResizeObserver | null>(null);

  const updateTargetRect = useCallback(() => {
    if (!active || !currentStep || typeof document === "undefined") {
      setTargetRect(null);
      return;
    }

    const stepId = currentStep.id.toLowerCase();
    const selectors = [
      `[data-tour="${stepId}"]`,
      `[data-tour-target="${stepId}"]`,
      `[data-tour="${currentStep.application}"]`,
      `#tour-step-${stepId}`,
      `[data-testid="${stepId}-card"]`,
      "#main-content",
      "main [role='main']",
      ".page-enter",
    ];

    let element: HTMLElement | null = null;
    for (const sel of selectors) {
      const el = document.querySelector<HTMLElement>(sel);
      if (el && el.offsetParent !== null) {
        element = el;
        break;
      }
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [active, currentStep]);

  useEffect(() => {
    updateTargetRect();
    const handleResize = () => { updateTargetRect(); };
    const handleScroll = () => { updateTargetRect(); };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    const interval = setInterval(updateTargetRect, 250);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
      clearInterval(interval);
      observerRef.current?.disconnect();
    };
  }, [updateTargetRect]);

  if (!active || !currentStep) return null;

  const isLastStep = currentStepIndex >= totalSteps - 1;
  const displayText = narration || currentStep.narration;

  // Calculate tooltip positioning
  let tooltipStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    maxWidth: "420px",
    zIndex: 45,
  };

  if (targetRect && typeof window !== "undefined") {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const leftPos = Math.max(16, Math.min(window.innerWidth - 440, targetCenterX - 210));

    if (spaceBelow > 260 || spaceBelow > spaceAbove) {
      tooltipStyle = {
        position: "fixed",
        top: `${String(Math.min(window.innerHeight - 270, targetRect.bottom + 16))}px`,
        left: `${String(leftPos)}px`,
        maxWidth: "420px",
        zIndex: 45,
      };
    } else {
      tooltipStyle = {
        position: "fixed",
        top: `${String(Math.max(16, targetRect.top - 240))}px`,
        left: `${String(leftPos)}px`,
        maxWidth: "420px",
        zIndex: 45,
      };
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none transition-opacity duration-300"
      aria-live="polite"
    >
      {/* Target spotlight glow highlight */}
      {targetRect && (
        <div
          style={{
            position: "fixed",
            left: `${String(Math.max(4, targetRect.left - 6))}px`,
            top: `${String(Math.max(4, targetRect.top - 6))}px`,
            width: `${String(targetRect.width + 12)}px`,
            height: `${String(targetRect.height + 12)}px`,
            borderRadius: "14px",
            boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.6), 0 0 30px rgba(56, 189, 248, 0.45)",
            transition: reduced ? "none" : "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="pointer-events-none border-2 border-primary/60 bg-primary/5"
          aria-hidden="true"
        />
      )}

      {/* Floating Tour Step Dialog / Tooltip */}
      <div
        style={tooltipStyle}
        className="pointer-events-auto rounded-xl border border-primary/40 bg-surface/95 dark:bg-surface/90 backdrop-blur-xl p-4 shadow-2xl transition-all duration-300 ease-out"
        role="dialog"
        aria-label={`Tour step: ${currentStep.title}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-text-inverse text-[10px] font-bold shadow-sm">
              {currentStepIndex + 1}
            </span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              EAIP Tour
            </span>
          </div>
          <span className="text-[10px] text-text-muted font-mono bg-surface-secondary px-2 py-0.5 rounded-full border border-border">
            {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>

        {/* Title & Narration */}
        <div className="space-y-1.5 mb-3">
          <h4 className="text-sm font-semibold text-text tracking-tight">
            {currentStep.title}
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
            {displayText}
          </p>
          {currentStep.why_it_matters && (
            <p className="text-[11px] text-primary/90 bg-primary-subtle/50 px-2 py-1 rounded border border-primary/10 mt-1.5">
              💡 {currentStep.why_it_matters}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <TourButton
              onClick={onPrevious}
              disabled={currentStepIndex === 0}
              aria-label="Previous tour step"
            >
              <PreviousIcon /> Prev
            </TourButton>
            <TourButton onClick={onSkip} aria-label="Skip this tour step">
              <SkipIcon /> Skip
            </TourButton>
          </div>
          <div className="flex items-center gap-1.5">
            <TourButton onClick={onStop} variant="danger" aria-label="End tour">
              <StopIcon /> Stop
            </TourButton>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1 text-[11px] font-semibold text-text-inverse shadow-sm transition-all hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
              aria-label={isLastStep ? "Finish tour" : "Next tour step"}
            >
              {isLastStep ? "Finish" : "Next"} <NextIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TourButton({
  children,
  onClick,
  disabled = false,
  variant = "default",
  ...props
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  [key: string]: unknown;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "danger"
          ? "border border-danger/30 text-danger hover:bg-danger/10"
          : "border border-border bg-surface text-text-secondary hover:bg-surface-tertiary hover:text-text",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}

function PreviousIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17 18l-8.5-6L17 6v12zM7 6v12H5V6h2z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="1" />
    </svg>
  );
}

