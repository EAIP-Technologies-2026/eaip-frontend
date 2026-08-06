"use client";

import type { ReactNode, HTMLAttributes } from "react";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useOnClickOutside } from "@eaip/hooks";
import { calculatePosition, type PositioningSide, type PositioningAlign } from "./popover-engine";
import { useReducedMotion, durationTokens, easingTokens } from "@eaip/motion";

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  side: PositioningSide;
  align: PositioningAlign;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

export function usePopoverContext() {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover components must be inside <Popover>");
  return ctx;
}

export interface PopoverRootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: PositioningSide;
  align?: PositioningAlign;
  children: ReactNode;
}

export function PopoverRoot({
  open: controlledOpen,
  onOpenChange,
  side = "bottom",
  align = "center",
  children,
}: PopoverRootProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const containerRef = useOnClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });
  const triggerRef = React.useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, containerRef, side, align }}>
      <div ref={containerRef} className="relative inline-block" data-slot="popover">
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export interface PopoverTriggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PopoverTrigger({ children, className = "", ...props }: PopoverTriggerProps) {
  const { open, setOpen, triggerRef } = usePopoverContext();

  return (
    <div
      ref={triggerRef}
      onClick={() => {
        setOpen(!open);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(!open);
        }
      }}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-expanded={open}
      data-slot="popover-trigger"
      data-state={open ? "open" : "closed"}
      className={`inline-block cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function PopoverContent({ children, className = "", ...props }: PopoverContentProps) {
  const { open, triggerRef, side, align } = usePopoverContext();
  const prefersReducedMotion = useReducedMotion();

  if (!open) return null;

  let posStyle: React.CSSProperties = {};
  if (triggerRef.current) {
    const rect = triggerRef.current.getBoundingClientRect();
    const pos = calculatePosition({
      triggerRect: rect,
      contentRect: { width: 240, height: 160 },
      side,
      align,
      offset: 8,
    });
    posStyle = { position: "fixed", top: `${String(pos.top)}px`, left: `${String(pos.left)}px` };
  }

  const motionStyle = prefersReducedMotion
    ? { transitionDuration: "0.01ms" }
    : {
        transitionProperty: "opacity, transform",
        transitionDuration: durationTokens.fast,
        transitionTimingFunction: easingTokens.snappy,
      };

  return (
    <div
      role="dialog"
      data-slot="popover-content"
      data-state="open"
      style={{ ...posStyle, ...motionStyle }}
      className={`rounded-card border-border bg-surface shadow-elevated z-50 min-w-[200px] border p-4 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
});
