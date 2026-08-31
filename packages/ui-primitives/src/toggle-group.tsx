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
    default:
      "bg-surface-secondary hover:bg-surface-tertiary data-[active=true]:bg-primary data-[active=true]:text-text-inverse",
    outline:
      "border border-border hover:bg-surface-secondary data-[active=true]:border-primary data-[active=true]:bg-primary-subtle data-[active=true]:text-primary",
    segmented: "bg-surface rounded-button p-0.5 gap-0",
  };

  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "border-border/50 bg-surface-secondary/50 inline-flex rounded-lg border p-1 shadow-inner",
          className,
        )}
        role="radiogroup"
        {...props}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
              }}
              disabled={opt.disabled}
              className={cn(
                "rounded-md font-medium transition-all duration-200 ease-out",
                sizeMap[size],
                active
                  ? "bg-surface text-text border-border/40 border shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
                  : "text-text-muted hover:text-text border border-transparent hover:bg-black/5 dark:hover:bg-white/5",
                opt.disabled && "cursor-not-allowed opacity-50",
              )}
              role="radio"
              aria-checked={active}
            >
              <div className="flex items-center justify-center gap-1.5">
                {opt.icon}
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn("rounded-button border-border inline-flex overflow-hidden border", className)}
      role="radiogroup"
      {...props}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChange(opt.value);
            }}
            disabled={opt.disabled}
            className={cn(
              "transition-smooth border-border border-r font-medium last:border-r-0",
              sizeMap[size],
              variantMap[variant],
              active && variant !== "default" && "",
              opt.disabled && "cursor-not-allowed opacity-50",
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
