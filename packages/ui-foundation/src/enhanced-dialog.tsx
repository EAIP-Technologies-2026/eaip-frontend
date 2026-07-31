import type { ReactNode } from "react";
import { useEffect, useCallback } from "react";
import { cn } from "@eaip/core";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: DialogSize;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  description?: string;
}

const sizeClasses: Record<DialogSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100%-2rem)]",
};

export function Dialog({
  open,
  onClose,
  title,
  children,
  size = "md",
  closeOnOutsideClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  description,
}: DialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") {
        onClose();
      }
    },
    [closeOnEsc, onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      aria-describedby={description ? "dialog-description" : undefined}
    >
      <button
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeOnOutsideClick ? onClose : undefined}
        aria-label="Close dialog"
        type="button"
      />
      <div className={cn("relative z-10 w-full rounded-card border border-border bg-surface p-6 shadow-elevated", sizeClasses[size])}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">{title}</h2>
            {description && (
              <p id="dialog-description" className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="rounded-button p-1 text-text-muted transition-smooth hover:bg-surface-tertiary hover:text-text"
              aria-label="Close"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
