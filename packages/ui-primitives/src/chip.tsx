import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@eaip/core";

export type ChipVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";
export type ChipSize = "sm" | "md";

export interface ChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  onRemove?: () => void;
  icon?: ReactNode;
  removable?: boolean;
}

export function Chip({
  children,
  variant = "default",
  size = "md",
  onRemove,
  icon,
  removable = false,
  className,
  ...props
}: ChipProps) {
  const variantStyles: Record<ChipVariant, string> = {
    default: "bg-surface-tertiary text-text-secondary border border-border",
    primary: "bg-primary-subtle text-primary border border-primary/20",
    success: "bg-success-subtle text-success border border-success/20",
    warning: "bg-warning-subtle text-warning border border-warning/20",
    danger: "bg-danger-subtle text-danger border border-danger/20",
    info: "bg-primary-subtle/50 text-primary border border-primary/10",
  };

  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-smooth",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex shrink-0 rounded-full p-0.5 transition-smooth hover:bg-black/10"
          aria-label="Remove"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}