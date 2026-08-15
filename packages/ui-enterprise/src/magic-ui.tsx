"use client";

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@eaip/motion";
import { cn } from "@eaip/utilities";

export function IntelligenceBackground() {
  return (
    <div aria-hidden="true" className="intelligence-background">
      <span className="intelligence-background-orb intelligence-background-orb-1" />
      <span className="intelligence-background-orb intelligence-background-orb-2" />
      <span className="intelligence-background-orb intelligence-background-orb-3" />
      <span className="intelligence-background-orb intelligence-background-orb-4" />
      <span className="intelligence-background-orb intelligence-background-orb-5" />
    </div>
  );
}

export function MagicCard({
  children,
  className,
  interactive = true,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    cardRef.current.style.setProperty("--mouse-x", String(x) + "%");
    cardRef.current.style.setProperty("--mouse-y", String(y) + "%");
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "magic-card",
        interactive && "magic-card-interactive",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ProgressiveBlur({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("progressive-blur relative overflow-hidden", className)}>
      {children}
    </div>
  );
}

export interface ShimmerButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function ShimmerButton({
  children,
  className,
  disabled,
  ...props
}: ShimmerButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        "shimmer-button inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-text-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function IntelligenceOrbital({
  className,
  label = "Distributed intelligence system visualization",
}: {
  className?: string;
  label?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative aspect-square max-w-56 overflow-hidden",
        className,
      )}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        className="h-full w-full"
      >
        {/* Orbital rings — elliptical paths at different angles */}
        <ellipse
          cx="100" cy="100" rx="85" ry="35"
          stroke="var(--color-primary)" strokeOpacity="0.12"
          strokeWidth="1" fill="none"
          transform="rotate(-25 100 100)"
          strokeDasharray="4 6"
        />
        <ellipse
          cx="100" cy="100" rx="75" ry="30"
          stroke="var(--color-primary)" strokeOpacity="0.10"
          strokeWidth="1" fill="none"
          transform="rotate(35 100 100)"
          strokeDasharray="3 8"
        />
        <ellipse
          cx="100" cy="100" rx="65" ry="25"
          stroke="var(--color-accent)" strokeOpacity="0.08"
          strokeWidth="1" fill="none"
          transform="rotate(80 100 100)"
          strokeDasharray="5 7"
        />
        <ellipse
          cx="100" cy="100" rx="50" ry="20"
          stroke="var(--color-primary)" strokeOpacity="0.06"
          strokeWidth="1" fill="none"
          transform="rotate(-60 100 100)"
          strokeDasharray="2 10"
        />

        {/* Central nucleus — luminous core */}
        <circle cx="100" cy="100" r="12" fill="var(--color-primary)" fillOpacity="0.15" />
        <circle cx="100" cy="100" r="7" fill="var(--color-primary)" fillOpacity="0.25" />
        <circle cx="100" cy="100" r="3" fill="var(--color-primary)" fillOpacity="0.6" />

        {/* Orbital particles — moving along paths */}
        {!reduced && (
          <>
            <circle r="3" fill="var(--color-primary)" fillOpacity="0.7">
              <animateMotion
                dur="18s" repeatCount="indefinite"
                path="M15,0 A85,35 -25 1 1 -15,0 A85,35 -25 1 1 15,0"
                transform="translate(100,100) rotate(-25)"
              />
            </circle>
            <circle r="2.5" fill="var(--color-accent)" fillOpacity="0.6">
              <animateMotion
                dur="22s" repeatCount="indefinite"
                path="M12,0 A75,30 35 1 0 -12,0 A75,30 35 1 0 12,0"
                transform="translate(100,100) rotate(35)"
              />
            </circle>
            <circle r="2" fill="var(--color-primary)" fillOpacity="0.5">
              <animateMotion
                dur="15s" repeatCount="indefinite"
                path="M10,0 A65,25 80 1 1 -10,0 A65,25 80 1 1 10,0"
                transform="translate(100,100) rotate(80)"
              />
            </circle>
            <circle r="1.5" fill="var(--color-success)" fillOpacity="0.5">
              <animateMotion
                dur="26s" repeatCount="indefinite"
                path="M8,0 A50,20 -60 1 0 -8,0 A50,20 -60 1 0 8,0"
                transform="translate(100,100) rotate(-60)"
              />
            </circle>
            <circle r="2" fill="var(--color-primary)" fillOpacity="0.4">
              <animateMotion
                dur="30s" repeatCount="indefinite"
                path="M6,0 A40,15 10 1 1 -6,0 A40,15 10 1 1 6,0"
                transform="translate(100,100) rotate(10)"
              />
            </circle>
            <circle r="1.5" fill="var(--color-accent)" fillOpacity="0.4">
              <animateMotion
                dur="20s" repeatCount="indefinite"
                path="M5,0 A30,12 -45 1 0 -5,0 A30,12 -45 1 0 5,0"
                transform="translate(100,100) rotate(-45)"
              />
            </circle>
          </>
        )}

        {/* Static particle nodes for reduced motion */}
        {reduced && (
          <>
            <circle cx="185" cy="100" r="3" fill="var(--color-primary)" fillOpacity="0.7" />
            <circle cx="25" cy="100" r="2.5" fill="var(--color-accent)" fillOpacity="0.6" />
            <circle cx="100" cy="35" r="2" fill="var(--color-primary)" fillOpacity="0.5" />
            <circle cx="100" cy="165" r="1.5" fill="var(--color-success)" fillOpacity="0.5" />
            <circle cx="150" cy="50" r="2" fill="var(--color-primary)" fillOpacity="0.4" />
            <circle cx="50" cy="150" r="1.5" fill="var(--color-accent)" fillOpacity="0.4" />
          </>
        )}
      </svg>
    </div>
  );
}

export function BorderBeam({
  children,
  active = true,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-beam-wrap relative rounded-card p-px",
        active && "border-beam-active",
        className,
      )}
    >
      <div className="relative rounded-[calc(var(--radius-card)-1px)]">
        {children}
      </div>
    </div>
  );
}

export function NumberTicker({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      prevValueRef.current = value;
      return;
    }
    const start = prevValueRef.current;
    const delta = value - start;
    if (delta === 0) return;
    prevValueRef.current = value;
    const started = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - started) / 500, 1);
      setDisplay(
        Math.round(start + delta * (1 - Math.pow(1 - progress, 3))),
      );
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [value, reduced]);

  return (
    <span aria-live="polite" className={className}>
      {display.toLocaleString()}
    </span>
  );
}

export function AnimatedList({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={reduced ? undefined : "magic-list-item"}
          style={
            reduced
              ? undefined
              : { animationDelay: String(index * 40) + "ms" }
          }
        >
          {item}
        </div>
      ))}
    </div>
  );
}

export function OrbitingCircles({
  center,
  items,
  className,
}: {
  center: ReactNode;
  items: ReactNode[];
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <div
      className={cn(
        "relative flex min-h-56 items-center justify-center overflow-visible",
        className,
      )}
    >
      <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary-subtle text-center text-xs font-semibold text-primary shadow-glow">
        {center}
      </div>
      <div
        className={cn(
          "magic-orbit-ring absolute inset-5 rounded-full border border-dashed border-primary/25",
          !reduced && "magic-orbit-ring-animated",
        )}
      />
      <div className="magic-orbit-track absolute inset-0">
        {items.map((item, index) => (
          <div
            key={index}
            className="magic-orbit-node absolute flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-[10px] font-medium text-text-secondary shadow-card"
            style={{
              "--orbit-angle": `${String(index * (360 / Math.max(items.length, 1)))}deg`,
            } as CSSProperties}
          >
            <span className="magic-orbit-node-content">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnimatedBeam({
  steps,
  className,
}: {
  steps: string[];
  className?: string;
}) {
  return (
    <div
      aria-label="Governed intelligence flow"
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 text-center",
        className,
      )}
    >
      {steps.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="rounded-full border border-primary/20 bg-primary-subtle px-3 py-1.5 text-xs font-medium text-primary"
          >
            {step}
          </span>
          {index < steps.length - 1 ? (
            <span aria-hidden="true" className="text-primary/50">
              →
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function BentoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bento-grid", className)}>{children}</div>
  );
}

export function BentoGridItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bento-grid-item", className)}>{children}</div>
  );
}

export function Dock({
  items,
  className,
}: {
  items: { label: string; onClick: () => void; icon?: ReactNode }[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Context actions"
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-card border border-border bg-surface/90 p-1 shadow-elevated backdrop-blur",
        className,
      )}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className="inline-flex min-h-10 items-center gap-2 rounded-button px-3 text-xs font-medium text-text-secondary transition-all duration-200 hover:bg-surface-tertiary hover:text-text hover:translate-y-[-1px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export interface MathematicalLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function MathematicalLoader({
  size = "md",
  className,
  label = "Loading",
}: MathematicalLoaderProps) {
  const reduced = useReducedMotion();
  const dims = { sm: 48, md: 72, lg: 96 }[size];
  const core = dims * 0.12;
  const strokeWidth = size === "sm" ? 0.8 : size === "md" ? 1 : 1.2;

  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex flex-col items-center justify-center gap-3", className)}
    >
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 100 100"
        fill="none"
        className="text-primary"
      >
        {/* Orbital rings */}
        <ellipse
          cx="50" cy="50" rx="42" ry="18"
          stroke="currentColor" strokeOpacity="0.12"
          strokeWidth={strokeWidth} fill="none"
          transform="rotate(-20 50 50)"
          strokeDasharray="3 5"
        />
        <ellipse
          cx="50" cy="50" rx="35" ry="14"
          stroke="currentColor" strokeOpacity="0.10"
          strokeWidth={strokeWidth} fill="none"
          transform="rotate(40 50 50)"
          strokeDasharray="2 6"
        />
        <ellipse
          cx="50" cy="50" rx="26" ry="10"
          stroke="currentColor" strokeOpacity="0.08"
          strokeWidth={strokeWidth} fill="none"
          transform="rotate(80 50 50)"
          strokeDasharray="4 4"
        />

        {/* Central core */}
        <circle cx="50" cy="50" r={core} fill="currentColor" fillOpacity="0.15" />
        <circle cx="50" cy="50" r={core * 0.6} fill="currentColor" fillOpacity="0.25" />
        <circle cx="50" cy="50" r={core * 0.3} fill="currentColor" fillOpacity="0.5" />

        {/* Moving particles */}
        {!reduced && (
          <>
            <circle r="2" fill="currentColor" fillOpacity="0.6">
              <animateMotion
                dur="4s" repeatCount="indefinite"
                path="M8,0 A42,18 -20 1 1 -8,0 A42,18 -20 1 1 8,0"
                transform="translate(50,50) rotate(-20)"
              />
            </circle>
            <circle r="1.5" fill="currentColor" fillOpacity="0.5">
              <animateMotion
                dur="5s" repeatCount="indefinite"
                path="M6,0 A35,14 40 1 0 -6,0 A35,14 40 1 0 6,0"
                transform="translate(50,50) rotate(40)"
              />
            </circle>
            <circle r="1.5" fill="currentColor" fillOpacity="0.4">
              <animateMotion
                dur="3.5s" repeatCount="indefinite"
                path="M5,0 A26,10 80 1 1 -5,0 A26,10 80 1 1 5,0"
                transform="translate(50,50) rotate(80)"
              />
            </circle>
          </>
        )}

        {/* Static dots for reduced motion */}
        {reduced && (
          <>
            <circle cx="92" cy="50" r="2" fill="currentColor" fillOpacity="0.6" />
            <circle cx="15" cy="50" r="1.5" fill="currentColor" fillOpacity="0.5" />
            <circle cx="50" cy="14" r="1.5" fill="currentColor" fillOpacity="0.4" />
          </>
        )}
      </svg>
      <span className="text-xs text-text-muted font-medium">{label}</span>
    </div>
  );
}
