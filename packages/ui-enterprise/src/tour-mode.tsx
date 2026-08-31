/* eslint-disable react-hooks/exhaustive-deps */
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
        "border-primary/30 bg-surface/90 dark:bg-surface/80 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-md transition-all duration-300",
        className,
      )}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-text-inverse inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm">
            {currentStepIndex + 1}
          </span>
          <span className="text-primary text-xs font-semibold tracking-wide uppercase">
            EAIP Guided Tour
          </span>
          {isPaused && (
            <span className="bg-warning/20 text-warning rounded-full px-2 py-0.5 text-[10px] font-medium">
              Paused
            </span>
          )}
        </div>
        <span className="text-text-muted font-mono text-[10px]">
          {currentStepIndex + 1} / {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="bg-surface-tertiary mb-2 h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="from-primary h-full rounded-full bg-gradient-to-r via-cyan-400 to-indigo-500 transition-all duration-500 ease-out"
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
          <p className="text-text text-sm font-semibold">{currentStep.title}</p>
          {currentStep.demo_description && (
            <p className="text-text-muted mt-0.5 text-[11px]">{currentStep.demo_description}</p>
          )}
        </div>
      )}

      {/* Controls */}
      {!isCompleted && (
        <div className="flex flex-wrap items-center gap-1.5">
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
          <TourButton
            onClick={onPrevious}
            aria-label="Previous step"
            disabled={currentStepIndex === 0}
          >
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
    const handleResize = () => {
      updateTargetRect();
    };
    const handleScroll = () => {
      updateTargetRect();
    };

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
  const displayText = narration ?? currentStep.narration;

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
      className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-300"
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
          className="border-primary/60 bg-primary/5 pointer-events-none border-2"
          aria-hidden="true"
        />
      )}

      {/* Floating Tour Step Dialog / Tooltip */}
      <div
        style={tooltipStyle}
        className="border-primary/40 bg-surface/95 dark:bg-surface/90 pointer-events-auto rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out"
        role="dialog"
        aria-label={`Tour step: ${currentStep.title}`}
      >
        {/* Header */}
        <div className="border-border/50 mb-2 flex items-center justify-between gap-2 border-b pb-2">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-text-inverse inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shadow-sm">
              {currentStepIndex + 1}
            </span>
            <span className="text-primary text-xs font-semibold tracking-wide uppercase">
              EAIP Tour
            </span>
          </div>
          <span className="text-text-muted bg-surface-secondary border-border rounded-full border px-2 py-0.5 font-mono text-[10px]">
            {currentStepIndex + 1} of {totalSteps}
          </span>
        </div>

        {/* Title & Narration */}
        <div className="mb-3 space-y-1.5">
          <h4 className="text-text text-sm font-semibold tracking-tight">{currentStep.title}</h4>
          <p className="text-text-secondary line-clamp-3 text-xs leading-relaxed">{displayText}</p>
          {currentStep.why_it_matters && (
            <p className="text-primary/90 bg-primary-subtle/50 border-primary/10 mt-1.5 rounded border px-2 py-1 text-[11px]">
              💡 {currentStep.why_it_matters}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="border-border/40 flex items-center justify-between gap-2 border-t pt-1">
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
              className="bg-primary text-text-inverse hover:bg-primary-hover focus:ring-primary inline-flex items-center gap-1 rounded-md px-3 py-1 text-[11px] font-semibold shadow-sm transition-all focus:ring-2 focus:ring-offset-1 focus:outline-none"
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
        "focus:ring-primary inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus:ring-2 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40",
        variant === "danger"
          ? "border-danger/30 text-danger hover:bg-danger/10 border"
          : "border-border bg-surface text-text-secondary hover:bg-surface-tertiary hover:text-text border",
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
