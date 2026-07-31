import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@eaip/core";

export interface Step {
  id: string;
  label: ReactNode;
  description?: string;
  icon?: ReactNode;
}

export interface StepperProps extends HTMLAttributes<HTMLOListElement> {
  steps: Step[];
  currentStep: string;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  clickable?: boolean;
  onStepClick?: (stepId: string) => void;
}

const sizeStyles: Record<"sm" | "md" | "lg", { circle: string; number: string; connector: string }> = {
  sm: { circle: "h-6 w-6", number: "text-xs", connector: "h-0.5" },
  md: { circle: "h-8 w-8", number: "text-sm", connector: "h-0.5" },
  lg: { circle: "h-10 w-10", number: "text-base", connector: "h-1" },
};

export function Stepper({
  steps,
  currentStep,
  orientation = "horizontal",
  size = "md",
  clickable = false,
  onStepClick,
  className,
  ...props
}: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const styles = sizeStyles[size];

  return (
    <ol
      className={cn(
        "flex",
        orientation === "horizontal" ? "w-full items-center" : "flex-col gap-0",
        className,
      )}
      {...props}
    >
      {steps.map((step, index) => {
        const completed = index < currentIndex;
        const active = step.id === currentStep;
        const last = index === steps.length - 1;

        const circle = (
          <span
            className={cn(
              "flex items-center justify-center rounded-full font-semibold ring-2 transition-smooth",
              styles.circle,
              styles.number,
              completed
                ? "bg-primary text-text-inverse ring-primary"
                : active
                  ? "bg-primary-subtle text-primary ring-primary"
                  : "bg-surface-tertiary text-text-muted ring-border",
              clickable && !active && !completed && "cursor-pointer hover:ring-primary/50",
            )}
            onClick={() => {
              if (clickable && onStepClick) onStepClick(step.id);
            }}
            onKeyDown={(e) => {
              if (clickable && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onStepClick?.(step.id);
              }
            }}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            aria-label={String(index + 1)}
          >
            {completed ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : step.icon ?? (
              index + 1
            )}
          </span>
        );

        return (
          <li
            key={step.id}
            className={cn(
              "flex",
              orientation === "horizontal"
                ? "flex-1 flex-col items-center"
                : "flex-row items-start gap-3",
            )}
          >
            <div className={cn(
              "flex",
              orientation === "horizontal" ? "flex-col items-center" : "flex-row items-start",
            )}>
              {circle}
              {!last && (
                <div
                  className={cn(
                    orientation === "horizontal"
                      ? cn("w-full", styles.connector)
                      : cn("w-0.5 h-8 ml-[13px]"),
                    "rounded",
                    completed ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className={cn(
              orientation === "horizontal"
                ? "mt-2 text-center"
                : "pb-6",
            )}>
              <div className={cn(
                "text-xs font-medium",
                active ? "text-text" : completed ? "text-text-secondary" : "text-text-muted",
              )}>
                {step.label}
              </div>
              {step.description && (
                <div className="text-xs text-text-muted mt-0.5">{step.description}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
