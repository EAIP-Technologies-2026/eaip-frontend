"use client";

import type { HTMLAttributes } from "react";
import { Spinner } from "./spinner";

export { Spinner };
export type { SpinnerProps, SpinnerSize } from "./spinner";

export interface LinearProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
}

export function LinearProgress({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  className = "",
  ...props
}: LinearProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };
  const variantStyles = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div
      data-slot="linear-progress"
      data-variant={variant}
      className={`w-full ${className}`}
      {...props}
    >
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`bg-surface-tertiary w-full overflow-hidden rounded-full ${heights[size]}`}
      >
        <div
          className={`h-full transition-all duration-300 ease-out ${variantStyles[variant]}`}
          style={{ width: `${String(percentage)}%` }}
        />
      </div>
      {showLabel ? (
        <p className="text-text-secondary mt-1 text-right text-xs">{`${String(Math.round(percentage))}%`}</p>
      ) : null}
    </div>
  );
}

export interface CircularProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  showLabel = false,
  className = "",
  ...props
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      data-slot="circular-progress"
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-surface-tertiary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300 ease-out"
        />
      </svg>
      {showLabel ? (
        <span className="text-text absolute text-[10px] font-semibold">{`${String(Math.round(percentage))}%`}</span>
      ) : null}
    </div>
  );
}
