import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@eaip/core";

export interface ToggleOption {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ToggleGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  options: ToggleOption[];
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "segmented";
}

export function ToggleGroup({
  value,
  onChange,
  options,
  size = "md",
  variant = "default",
  className,
  ...props
}: ToggleGroupProps) {
  const sizeMap = {
    sm: "px-2.5 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const variantMap = {
    default: "bg-surface-secondary hover:bg-surface-tertiary data-[active=true]:bg-primary data-[active=true]:text-text-inverse",
    outline: "border border-border hover:bg-surface-secondary data-[active=true]:border-primary data-[active=true]:bg-primary-subtle data-[active=true]:text-primary",
    segmented: "bg-surface rounded-button p-0.5 gap-0",
  };

  if (variant === "segmented") {
    return (
      <div className={cn("inline-flex rounded-button border border-border bg-surface p-0.5", className)} role="radiogroup" {...props}>
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); }}
              disabled={opt.disabled}
              className={cn(
                "rounded-button font-medium transition-smooth",
                sizeMap[size],
                active
                  ? "bg-primary text-text-inverse shadow-sm"
                  : "text-text-secondary hover:text-text",
                opt.disabled && "opacity-50 cursor-not-allowed",
              )}
              role="radio"
              aria-checked={active}
            >
              {opt.icon}
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex rounded-button border border-border overflow-hidden", className)} role="radiogroup" {...props}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); }}
            disabled={opt.disabled}
            className={cn(
              "font-medium transition-smooth border-r border-border last:border-r-0",
              sizeMap[size],
              variantMap[variant],
              active && variant !== "default" && "",
              opt.disabled && "opacity-50 cursor-not-allowed",
            )}
            data-active={active}
            role="radio"
            aria-checked={active}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}