import type { ReactNode, HTMLAttributes } from "react";
import { useState } from "react";
import { cn } from "@eaip/core";

export type BannerVariant = "info" | "success" | "warning" | "error";

export interface BannerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: BannerVariant;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: ReactNode;
}

const variantStyles: Record<BannerVariant, string> = {
  info: "bg-primary text-text-inverse",
  success: "bg-success text-text-inverse",
  warning: "bg-warning text-text",
  error: "bg-danger text-text-inverse",
};

export function Banner({
  children,
  variant = "info",
  dismissible = false,
  onDismiss,
  action,
  className,
  ...props
}: BannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-6 py-3 text-sm font-medium",
        variantStyles[variant],
        className,
      )}
      role="banner"
      {...props}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {children}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {action}
        {dismissible && (
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              onDismiss?.();
            }}
            className="rounded p-0.5 opacity-80 transition-smooth hover:opacity-100"
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}