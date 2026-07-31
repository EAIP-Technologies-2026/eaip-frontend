import type { ReactNode } from "react";
import { useEffect, useCallback } from "react";
import { cn } from "@eaip/core";

export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  position?: "left" | "right";
  size?: DrawerSize;
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  position = "right",
  size = "md",
  closeOnOutsideClick = true,
  closeOnEsc = true,
  showCloseButton = true,
}: DrawerProps) {
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
    <div className="fixed inset-0 z-50">
      <button
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-label="Close drawer"
        type="button"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />
      <div
        className={cn(
          "fixed top-0 h-full w-full bg-surface shadow-elevated transition-transform duration-300",
          sizeClasses[size],
          position === "right" ? "right-0" : "left-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text">{title}</h2>
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
        <div className="h-[calc(100%-4rem)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
