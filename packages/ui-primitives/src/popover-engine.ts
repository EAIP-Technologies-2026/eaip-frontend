"use client";

export type PositioningSide = "top" | "bottom" | "left" | "right";
export type PositioningAlign = "start" | "center" | "end";

export interface PositionOptions {
  triggerRect: DOMRect;
  contentRect: { width: number; height: number };
  side?: PositioningSide;
  align?: PositioningAlign;
  offset?: number;
}

export interface CalculatedPosition {
  top: number;
  left: number;
}

export function calculatePosition({
  triggerRect,
  contentRect,
  side = "bottom",
  align = "center",
  offset = 8,
}: PositionOptions): CalculatedPosition {
  let top = 0;
  let left = 0;

  // Calculate side position
  if (side === "top") {
    top = triggerRect.top - contentRect.height - offset;
  } else if (side === "bottom") {
    top = triggerRect.bottom + offset;
  } else if (side === "left") {
    left = triggerRect.left - contentRect.width - offset;
  } else {
    left = triggerRect.right + offset;
  }

  // Calculate alignment for top/bottom
  if (side === "top" || side === "bottom") {
    if (align === "start") {
      left = triggerRect.left;
    } else if (align === "end") {
      left = triggerRect.right - contentRect.width;
    } else {
      left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
    }
  }

  // Calculate alignment for left/right
  if (side === "left" || side === "right") {
    if (align === "start") {
      top = triggerRect.top;
    } else if (align === "end") {
      top = triggerRect.bottom - contentRect.height;
    } else {
      top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
    }
  }

  return { top, left };
}
