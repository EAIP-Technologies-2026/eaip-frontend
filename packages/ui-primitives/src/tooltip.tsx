"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { createContext, useContext, useState, useRef } from "react";
import { calculatePosition, type PositioningSide, type PositioningAlign } from "./popover-engine";
import { useReducedMotion, durationTokens, easingTokens } from "@eaip/motion";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  side: PositioningSide;
  align: PositioningAlign;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be inside <Tooltip>");
  return ctx;
}

export interface TooltipRootProps {
  children: ReactNode;
  content?: ReactNode;
  side?: PositioningSide;
  align?: PositioningAlign;
  delayMs?: number;
}

export function TooltipRoot({
  children,
  content,
  side = "top",
  align = "center",
}: TooltipRootProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  if (content !== undefined) {
    return (
      <TooltipContext.Provider value={{ open, setOpen, triggerRef, side, align }}>
        <div className="relative inline-block" data-slot="tooltip">
          <TooltipTrigger>{children}</TooltipTrigger>
          <TooltipContent>{content}</TooltipContent>
        </div>
      </TooltipContext.Provider>
    );
  }

  return (
    <TooltipContext.Provider value={{ open, setOpen, triggerRef, side, align }}>
      <div className="relative inline-block" data-slot="tooltip">
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export interface TooltipTriggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TooltipTrigger({ children, className = "", ...props }: TooltipTriggerProps) {
  const { setOpen, triggerRef } = useTooltipContext();

  return (
    <div
      ref={triggerRef}
      onMouseEnter={() => {
        setOpen(true);
      }}
      onMouseLeave={() => {
        setOpen(false);
      }}
      onFocus={() => {
        setOpen(true);
      }}
      onBlur={() => {
        setOpen(false);
      }}
      data-slot="tooltip-trigger"
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function TooltipContent({ children, className = "", ...props }: TooltipContentProps) {
  const { open, triggerRef, side, align } = useTooltipContext();
  const prefersReducedMotion = useReducedMotion();

  if (!open) return null;

  let posStyle: React.CSSProperties = {};
  if (triggerRef.current) {
    const rect = triggerRef.current.getBoundingClientRect();
    const pos = calculatePosition({
      triggerRect: rect,
      contentRect: { width: 120, height: 32 },
      side,
      align,
      offset: 6,
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
      role="tooltip"
      data-slot="tooltip-content"
      data-state="open"
      style={{ ...posStyle, ...motionStyle }}
      className={`rounded-card z-50 border border-border bg-surface-elevated px-2.5 py-1 text-xs font-medium text-text shadow-elevated ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export const Tooltip = Object.assign(TooltipRoot, {
  Trigger: TooltipTrigger,
  Content: TooltipContent,
});
