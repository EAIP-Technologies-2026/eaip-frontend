"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { useEffect } from "react";
import { useReducedMotion, durationTokens, easingTokens } from "@eaip/motion";
import { EnterpriseIcon } from "@eaip/icons";

export type DrawerPosition = "left" | "right" | "top" | "bottom";
export type DrawerSize = "sm" | "md" | "lg";

export interface DrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  position?: DrawerPosition;
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
  className = "",
  ...props
}: DrawerProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (closeOnEsc && e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const positionClasses = {
    left: "left-0 top-0 h-full",
    right: "right-0 top-0 h-full",
    top: "top-0 left-0 w-full max-h-[80vh]",
    bottom: "bottom-0 left-0 w-full max-h-[80vh]",
  };

  const motionStyle = prefersReducedMotion
    ? { transitionDuration: "0.01ms" }
    : {
        transitionProperty: "transform, opacity",
        transitionDuration: durationTokens.normal,
        transitionTimingFunction: easingTokens.premium,
      };

  return (
    <div data-slot="drawer" data-state="open" className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close backdrop"
        className="fixed inset-0 cursor-default border-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />
      <div
        style={motionStyle}
        className={`bg-surface shadow-elevated border-border fixed z-10 w-full ${positionClasses[position]} ${
          position === "left" || position === "right" ? sizeClasses[size] : ""
        } ${className}`}
        {...props}
      >
        {title || showCloseButton ? (
          <div className="border-border flex items-center justify-between border-b px-6 py-4">
            {title ? <h2 className="text-text text-lg font-semibold">{title}</h2> : <div />}
            {showCloseButton ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded-button text-text-muted hover:bg-surface-tertiary hover:text-text p-1 transition-colors"
              >
                <EnterpriseIcon name="x" size={20} />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="h-[calc(100%-4rem)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

export const Sheet = Drawer;
