import { useId } from "react";
import { cn } from "@eaip/core";

export type PersonalAssistantMarkState =
  | "idle"
  | "thinking"
  | "executing"
  | "speaking"
  | "listening"
  | "transcribing"
  | "approval"
  | "error";

export interface PersonalAssistantMarkProps {
  size?: "sm" | "md" | "lg";
  state?: PersonalAssistantMarkState;
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-16 w-16",
} as const;

/** Original EAIP spectral assistant identity mark. */
export function PersonalAssistantMark({
  size = "md",
  state = "idle",
  className,
  label = "EAIP Personal Assistant",
}: PersonalAssistantMarkProps) {
  const rawId = useId();
  const gradientId = `eaip-assistant-gradient-${rawId.replace(/:/g, "")}`;
  const active = state !== "idle" && state !== "error";
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-surface-glass shadow-[0_0_24px_rgba(56,189,248,0.18)]",
        sizeClasses[size],
        active && "motion-safe:animate-pulse",
        state === "approval" && "ring-2 ring-warning/40",
        state === "error" && "ring-2 ring-danger/30",
        className,
      )}
      aria-label={label}
      role="img"
    >
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className="h-[72%] w-[72%]">
        <defs>
          <linearGradient id={gradientId} x1="7" y1="7" x2="42" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#22D3EE" />
            <stop offset="0.42" stopColor="#3B82F6" />
            <stop offset="0.72" stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <path
          d="M24 4 29.5 18.5 44 24l-14.5 5.5L24 44l-5.5-14.5L4 24l14.5-5.5L24 4Z"
          fill={`url(#${gradientId})`}
          fillOpacity=".24"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
        />
        <path
          d="M11 27.5c5.2-8.7 12.5-11.2 26-7.4M13.5 33c6.1-5.8 12.8-7.1 23-3.2"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth="2.5"
        />
        <circle cx="24" cy="24" r="3.25" fill="white" fillOpacity=".9" />
      </svg>
    </span>
  );
}
