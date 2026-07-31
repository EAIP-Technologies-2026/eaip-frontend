import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@eaip/core";

export type TabsVariant = "underline" | "pills" | "buttons";

export interface Tab {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: TabsVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const sizeStyles = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
};

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: TabsProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <nav
        className={cn(
          "flex",
          variant === "underline"
            ? "border-b border-border gap-0"
            : variant === "pills"
              ? "gap-1"
              : "rounded-button border border-border bg-surface p-0.5 gap-0",
          fullWidth && "w-full",
          fullWidth && (variant === "pills" || variant === "buttons") ? "flex" : "",
          variant === "underline" ? "" : "inline-flex",
        )}
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { onChange(tab.id); }}
              disabled={tab.disabled}
              className={cn(
                "inline-flex items-center justify-center gap-2 font-medium transition-smooth whitespace-nowrap",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                tab.disabled && "pointer-events-none",
                fullWidth && "flex-1",
                variant === "underline"
                  ? cn(
                      "border-b-2 px-1 py-3",
                      sizeStyles[size],
                      active
                        ? "border-primary text-primary"
                        : "border-transparent text-text-secondary hover:border-border hover:text-text",
                    )
                  : variant === "pills"
                    ? cn(
                        "rounded-button",
                        active
                          ? "bg-primary text-text-inverse shadow-sm"
                          : "text-text-secondary hover:bg-surface-tertiary hover:text-text",
                        sizeStyles[size],
                      )
                    : cn(
                        "rounded-button",
                        active
                          ? "bg-surface text-text shadow-sm"
                          : "text-text-secondary hover:text-text",
                        sizeStyles[size],
                      ),
              )}
              aria-current={active ? "page" : undefined}
              role="tab"
              aria-selected={active}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}