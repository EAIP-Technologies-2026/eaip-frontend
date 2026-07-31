import type { HTMLAttributes } from "react";
import { cn } from "@eaip/core";

export type SpinnerSize = "sm" | "md" | "lg" | "xl";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
}

const sizeMap: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};

export function Spinner({ size = "md", className, ...props }: SpinnerProps) {
  const px = sizeMap[size];
  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <svg
        className="animate-spin"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
      </svg>
    </div>
  );
}