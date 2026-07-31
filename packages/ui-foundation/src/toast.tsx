import type { ReactNode, HTMLAttributes } from "react";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@eaip/core";
import type { AlertVariant } from "./alert";

export type ToastVariant = AlertVariant;

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: ToastVariant;
  duration?: number;
  onDismiss?: () => void;
  dismissible?: boolean;
}

const variantStyles: Record<ToastVariant, string> = {
  info: "bg-surface border-l-4 border-l-primary shadow-elevated",
  success: "bg-surface border-l-4 border-l-success shadow-elevated",
  warning: "bg-surface border-l-4 border-l-warning shadow-elevated",
  error: "bg-surface border-l-4 border-l-danger shadow-elevated",
};

export function Toast({
  children,
  variant = "info",
  duration = 5000,
  onDismiss,
  dismissible = true,
  className,
  ...props
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => {
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (duration <= 0) return;
    const timer = setTimeout(dismiss, duration);
    return () => { clearTimeout(timer); };
  }, [duration, dismiss]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "toast-enter flex items-center gap-3 rounded-card px-4 py-3 text-sm text-text shadow-elevated",
        variantStyles[variant],
        className,
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      <div className="flex-1">{children}</div>
      {dismissible && (
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded p-0.5 text-text-muted transition-smooth hover:text-text"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

export interface ToastContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export function ToastContainer({
  children,
  position = "top-right",
  className,
  ...props
}: ToastContainerProps) {
  const positionStyles = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <div
      className={cn(
        "fixed z-[100] flex flex-col gap-2 pointer-events-auto",
        positionStyles[position],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}