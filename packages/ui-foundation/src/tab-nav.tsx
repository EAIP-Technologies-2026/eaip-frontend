import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";

export interface TabNavItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  href?: string;
  disabled?: boolean;
}

export interface TabNavProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  items: TabNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills" | "bar";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
}

const variantStyles = {
  underline: {
    active: "border-primary text-primary",
    inactive: "border-transparent text-text-secondary hover:border-border hover:text-text",
    wrapper: "border-b border-border",
    item: "border-b-2",
  },
  pills: {
    active: "bg-primary text-text-inverse shadow-sm",
    inactive: "text-text-secondary hover:bg-surface-tertiary hover:text-text",
    wrapper: "",
    item: "rounded-button",
  },
  bar: {
    active: "bg-primary text-text-inverse shadow-sm",
    inactive: "text-text-secondary hover:bg-surface-tertiary hover:text-text",
    wrapper: "bg-surface-tertiary rounded-button p-0.5",
    item: "rounded-button",
  },
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-base gap-2",
};

export function TabNav({
  items,
  activeId,
  onChange,
  variant = "underline",
  size = "md",
  orientation = "horizontal",
  className,
  ...props
}: TabNavProps) {
  const styles = variantStyles[variant];

  return (
    <nav
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col" : "flex-row",
        styles.wrapper,
        className,
      )}
      aria-label="Tab navigation"
      {...props}
    >
      {items.map((item) => {
        const active = item.id === activeId;
        const Component = item.href ? "a" : "button";
        return (
          <Component
            key={item.id}
            type={Component === "button" ? "button" : undefined}
            href={item.href}
            onClick={(e) => {
              if (Component === "button" || !item.href) {
                e.preventDefault();
                onChange(item.id);
              }
            }}
            disabled={Component === "button" ? item.disabled : undefined}
            className={cn(
              "inline-flex items-center justify-center font-medium transition-smooth whitespace-nowrap",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              styles.item,
              active ? styles.active : styles.inactive,
              sizeStyles[size],
              orientation === "vertical" && "justify-start",
            )}
            aria-current={active ? "page" : undefined}
            role={Component === "button" ? "tab" : undefined}
            aria-selected={Component === "button" ? active : undefined}
          >
            {item.icon}
            {item.label}
          </Component>
        );
      })}
    </nav>
  );
}
