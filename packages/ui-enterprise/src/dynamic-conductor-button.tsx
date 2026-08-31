"use client";

import { useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { cn } from "@eaip/core";
import { useReducedMotion } from "@eaip/motion";

/* ─── Types ─── */

export type ConductorButtonState =
  | "idle"
  | "hover"
  | "thinking"
  | "executing"
  | "speaking"
  | "listening"
  | "transcribing"
  | "paused"
  | "approval"
  | "error"
  | "open";

export interface DynamicConductorButtonProps {
  state?: ConductorButtonState;
  label?: string;
  onClick?: () => void;
  ariaExpanded?: boolean;
  className?: string;
  badge?: number | string;
}

/* ─── State → color mapping ─── */

function getStateColors(state: ConductorButtonState): {
  inner: string;
  outer: string;
  glow: string;
} {
  switch (state) {
    case "thinking":
    case "executing":
      return {
        inner: "oklch(0.65 0.18 260)",
        outer: "oklch(0.35 0.12 260)",
        glow: "rgba(99,102,241,0.4)",
      };
    case "listening":
    case "transcribing":
      return {
        inner: "oklch(0.70 0.20 195)",
        outer: "oklch(0.35 0.14 195)",
        glow: "rgba(56,189,248,0.4)",
      };
    case "speaking":
      return {
        inner: "oklch(0.65 0.22 280)",
        outer: "oklch(0.30 0.14 280)",
        glow: "rgba(139,92,246,0.4)",
      };
    case "paused":
      return {
        inner: "oklch(0.55 0.08 60)",
        outer: "oklch(0.30 0.06 60)",
        glow: "rgba(251,191,36,0.3)",
      };
    case "approval":
      return {
        inner: "oklch(0.65 0.20 145)",
        outer: "oklch(0.30 0.12 145)",
        glow: "rgba(52,211,153,0.4)",
      };
    case "error":
      return {
        inner: "oklch(0.60 0.22 25)",
        outer: "oklch(0.30 0.14 25)",
        glow: "rgba(248,113,113,0.4)",
      };
    case "open":
      return {
        inner: "oklch(0.60 0.15 260)",
        outer: "oklch(0.25 0.10 260)",
        glow: "rgba(99,102,241,0.3)",
      };
    default:
      return {
        inner: "oklch(0.6061 0.2122 260.66)",
        outer: "oklch(0.1186 0.0248 260.66)",
        glow: "rgba(99,102,241,0.2)",
      };
  }
}

/* ─── Constants ─── */
const CIRCLE_COUNT = 6;
const ANGLE_STEP = 60;
const ANGLE_OFFSET = 30;

/* ─── Proximity zones ─── */
const ZONE_FULL = 80; // px — full interaction state
const ZONE_PROGRESSIVE = 180; // px — progressive expansion
const ZONE_SUBTLE = 280; // px — subtle attraction/glow

const IDLE_AMPLITUDE = 15;
const HOVER_AMPLITUDE = 40;
const IDLE_SCALE = 0.5;
const HOVER_SCALE = 0.85;
const MAGNETIC_MAX = 8; // px — max magnetic translation

/* ─── Component ─── */

export function DynamicConductorButton({
  state = "idle",
  label = "Open personal EAIP assistant",
  onClick,
  ariaExpanded = false,
  className,
  badge,
}: DynamicConductorButtonProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const proximityRef = useRef(0);
  const magneticRef = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number | null>(null);

  const colors = getStateColors(state);
  const isActive = state !== "idle" && state !== "hover" && state !== "open";

  /* ─── Proximity + magnetic update loop ─── */
  const updateFrame = useCallback(() => {
    const container = containerRef.current;
    const button = buttonRef.current;
    if (!container || !button) return;

    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = pointerRef.current.x - cx;
    const dy = pointerRef.current.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // --- Proximity (0..1) ---
    let targetProximity: number;
    if (dist <= ZONE_FULL) {
      targetProximity = 1;
    } else if (dist <= ZONE_PROGRESSIVE) {
      // Smooth ease from 1 → 0.4
      const t = (dist - ZONE_FULL) / (ZONE_PROGRESSIVE - ZONE_FULL);
      targetProximity = 1 - t * 0.6;
    } else if (dist <= ZONE_SUBTLE) {
      // Smooth ease from 0.4 → 0
      const t = (dist - ZONE_PROGRESSIVE) / (ZONE_SUBTLE - ZONE_PROGRESSIVE);
      targetProximity = 0.4 * (1 - t);
    } else {
      targetProximity = 0;
    }

    // Lerp proximity (slow for premium feel)
    proximityRef.current += (targetProximity - proximityRef.current) * 0.04;
    if (proximityRef.current < 0.003) proximityRef.current = 0;

    // --- Magnetic translation ---
    if (dist < ZONE_SUBTLE && dist > 1) {
      const magStrength = proximityRef.current * MAGNETIC_MAX;
      const angle = Math.atan2(dy, dx);
      const targetMx = Math.cos(angle) * magStrength;
      const targetMy = Math.sin(angle) * magStrength;
      magneticRef.current.x += (targetMx - magneticRef.current.x) * 0.06;
      magneticRef.current.y += (targetMy - magneticRef.current.y) * 0.06;
    } else {
      magneticRef.current.x += (0 - magneticRef.current.x) * 0.06;
      magneticRef.current.y += (0 - magneticRef.current.y) * 0.06;
    }

    // Snap magnetic to 0 when very close
    if (Math.abs(magneticRef.current.x) < 0.1) magneticRef.current.x = 0;
    if (Math.abs(magneticRef.current.y) < 0.1) magneticRef.current.y = 0;

    // --- Apply ---
    const amp = IDLE_AMPLITUDE + proximityRef.current * (HOVER_AMPLITUDE - IDLE_AMPLITUDE);
    const scale = IDLE_SCALE + proximityRef.current * (HOVER_SCALE - IDLE_SCALE);
    const glowBase = isActive ? 10 : 6;
    const glow = glowBase + proximityRef.current * 8;

    container.style.setProperty("--amplitude", `${String(amp)}px`);
    container.style.setProperty("--scale", String(scale));
    container.style.setProperty("--glow", `${String(glow)}px`);
    button.style.transform = `translate(${String(magneticRef.current.x)}px, ${String(magneticRef.current.y)}px)`;

    // Continue while active
    const needsUpdate =
      Math.abs(targetProximity - proximityRef.current) > 0.002 ||
      Math.abs(magneticRef.current.x) > 0.1 ||
      Math.abs(magneticRef.current.y) > 0.1 ||
      targetProximity > 0.01;

    if (needsUpdate) {
      rafRef.current = requestAnimationFrame(updateFrame);
    } else {
      rafRef.current = null;
    }
  }, [isActive]);

  useEffect(() => {
    if (reduced) return;

    const handleMove = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      rafRef.current ??= requestAnimationFrame(updateFrame);
    };
    const handleTouch = (e: TouchEvent) => {
      if (e.touches[0]) {
        pointerRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        rafRef.current ??= requestAnimationFrame(updateFrame);
      }
    };
    const handleLeave = () => {
      pointerRef.current = { x: -9999, y: -9999 };
      rafRef.current ??= requestAnimationFrame(updateFrame);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleTouch);
      document.removeEventListener("mouseleave", handleLeave);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [reduced, updateFrame]);

  /* ─── Handlers ─── */
  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    },
    [onClick],
  );

  /* ─── Circle style ─── */
  const getCircleStyle = (index: number): React.CSSProperties => {
    const angle = index * ANGLE_STEP + ANGLE_OFFSET;
    const gradient = isActive
      ? `radial-gradient(circle at 50% 0%, ${colors.outer}, ${colors.inner})`
      : `radial-gradient(circle at 50% 0%, oklch(0.1186 0.0248 260.66), oklch(0.3133 0.1419 260.73), oklch(0.6061 0.2122 260.66))`;
    return { "--angle": `${String(angle)}deg`, background: gradient } as React.CSSProperties;
  };

  return (
    <div data-tour="conductor" className={cn("fixed right-6 bottom-6 z-50", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={ariaExpanded}
        aria-haspopup="dialog"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "group relative flex items-center justify-center outline-none",
          "focus-visible:ring-primary focus-visible:ring-offset-surface focus-visible:ring-2 focus-visible:ring-offset-2",
          "cursor-pointer select-none",
          "transition-transform duration-500 ease-out",
        )}
        style={{ willChange: "transform" }}
      >
        <div
          ref={containerRef}
          className="conductor-orbital relative flex h-[50px] w-[50px] items-center justify-center"
        >
          {Array.from({ length: CIRCLE_COUNT }, (_, i) => (
            <div
              key={i}
              className={cn(
                "conductor-circle absolute h-[50px] w-[50px] rounded-full mix-blend-lighten",
                !reduced && "conductor-circle--animated",
                reduced && "conductor-circle--static",
              )}
              style={getCircleStyle(i)}
            />
          ))}
        </div>

        {badge != null && (
          <span className="bg-danger absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[8px] font-bold text-white">
            {badge}
          </span>
        )}

        {isActive && (
          <div
            className="absolute inset-0 animate-ping rounded-full"
            style={{ background: colors.glow, opacity: 0.2, animationDuration: "2s" }}
          />
        )}
      </button>

      <style>{`
        @property --amplitude { syntax: "<length>"; initial-value: 15px; inherits: false; }
        @property --scale { syntax: "<number>"; initial-value: 0.5; inherits: false; }

        .conductor-orbital {
          transition: filter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          filter: drop-shadow(0 0 var(--glow, 6px) rgba(99,102,241,0.2));
        }

        .conductor-circle {
          transform:
            translate(calc(cos(var(--angle)) * var(--amplitude)), calc(sin(var(--angle)) * var(--amplitude) * -1))
            scale(var(--scale))
            rotate(calc(-1 * var(--angle) + 17deg));
          transition: background 0.6s ease;
          will-change: transform;
        }

        .conductor-circle--animated {
          animation: conductor-expand 4.01s cubic-bezier(0.8, 0, 0.2, 1) infinite alternate;
        }

        .conductor-circle--static { --amplitude: 15px; --scale: 0.5; }

        @keyframes conductor-expand {
          0% { --amplitude: 15px; --scale: 0.5; }
          50% { --amplitude: 10px; --scale: 0.65; }
          100% { --amplitude: 15px; --scale: 0.65; }
        }

        @media (prefers-reduced-motion: reduce) {
          .conductor-circle { animation: none !important; --amplitude: 15px !important; --scale: 0.5 !important; }
          .conductor-orbital { filter: none !important; }
        }
      `}</style>
    </div>
  );
}
