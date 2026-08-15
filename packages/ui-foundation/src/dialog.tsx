"use client";

import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from "react";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useReducedMotion, durationTokens, easingTokens } from "@eaip/motion";
import { EnterpriseIcon } from "@eaip/icons";

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog compound components must be inside <Dialog>");
  return ctx;
}

export interface DialogRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
}

export function DialogRoot({
  open: controlledOpen,
  onOpenChange,
  onClose,
  children,
}: DialogRootProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;

  function handleSetOpen(nextOpen: boolean) {
    if (onOpenChange) onOpenChange(nextOpen);
    else setInternalOpen(nextOpen);
    if (!nextOpen && onClose) onClose();
  }

  return (
    <DialogContext.Provider value={{ open, setOpen: handleSetOpen }}>
      <div data-slot="dialog-root">{children}</div>
    </DialogContext.Provider>
  );
}

export interface DialogTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function DialogTrigger({ children, className = "", ...props }: DialogTriggerProps) {
  const { setOpen } = useDialogContext();
  return (
    <button
      type="button"
      onClick={() => {
        setOpen(true);
      }}
      data-slot="dialog-trigger"
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOutsideClick?: boolean;
  closeOnEsc?: boolean;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100%-2rem)]",
};

export function DialogContent({
  children,
  size = "md",
  closeOnOutsideClick = true,
  closeOnEsc = true,
  className = "",
  ...props
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext();
  const prefersReducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (closeOnEsc && e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, closeOnEsc, setOpen]);

  if (!open) return null;

  const motionStyle = prefersReducedMotion
    ? { transitionDuration: "0.01ms" }
    : {
        transitionProperty: "opacity, transform",
        transitionDuration: durationTokens.normal,
        transitionTimingFunction: easingTokens.premium,
      };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-slot="dialog-content"
      data-state="open"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close backdrop"
        className="fixed inset-0 cursor-default border-0 bg-scrim backdrop-blur-sm transition-opacity"
        onClick={
          closeOnOutsideClick
            ? () => {
                setOpen(false);
              }
            : undefined
        }
      />
      <div
        ref={contentRef}
        style={motionStyle}
        className={`liquid-glass rounded-card border-border relative z-10 w-full border p-6 focus:outline-none ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function DialogTitle({ children, className = "", ...props }: DialogTitleProps) {
  return (
    <h2
      data-slot="dialog-title"
      className={`text-text text-lg font-semibold ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
}

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function DialogDescription({ children, className = "", ...props }: DialogDescriptionProps) {
  return (
    <p
      data-slot="dialog-description"
      className={`text-text-secondary mt-1 text-sm ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function DialogClose({ className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { setOpen } = useDialogContext();
  return (
    <button
      type="button"
      onClick={() => {
        setOpen(false);
      }}
      aria-label="Close dialog"
      data-slot="dialog-close"
      className={`rounded-button text-text-muted hover:bg-surface-tertiary hover:text-text focus:ring-primary p-1 transition-colors focus:ring-2 focus:outline-none ${className}`}
      {...props}
    >
      <EnterpriseIcon name="x" size={20} />
    </button>
  );
}

export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Title: DialogTitle,
  Description: DialogDescription,
  Close: DialogClose,
});
