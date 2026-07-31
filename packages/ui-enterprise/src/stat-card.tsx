import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  icon?: ReactNode;
  loading?: boolean;
}

export function StatCard({ label, value, trend, icon, loading = false, className, ...props }: StatCardProps) {
  const trendColors = { up: "text-success", down: "text-danger", neutral: "text-text-muted" };
  const trendIcons = { up: "\u2191", down: "\u2193", neutral: "\u2192" };

  if (loading) {
    return (
      <div className={cn("rounded-card border border-border/60 bg-surface p-5 space-y-3", className)} {...props}>
        <div className="h-3 w-20 animate-pulse rounded bg-surface-tertiary" />
        <div className="h-7 w-16 animate-pulse rounded bg-surface-tertiary" />
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-card border border-border/60 bg-surface p-5 transition-premium card-hover-lift relative overflow-hidden",
      className
    )} {...props}>
      {/* Ambient accent glow */}
      <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary-subtle/40 blur-2xl pointer-events-none" aria-hidden="true" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-text-muted uppercase">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-text">{value}</p>
          {trend && (
            <p className={cn("flex items-center gap-1 text-xs font-medium", trendColors[trend.direction])}>
              <span>{trendIcons[trend.direction]}</span>
              {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle/80 text-primary shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export interface StatGroupProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
  children: ReactNode;
}

export function StatGroup({ columns = 4, children, className, ...props }: StatGroupProps) {
  const gridCols = { 2: "grid-cols-1 sm:grid-cols-2", 3: "grid-cols-1 sm:grid-cols-3", 4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" };
  return (
    <div className={cn("grid gap-4", gridCols[columns], className)} {...props}>
      {children}
    </div>
  );
}

export interface KPIBlockProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: ReactNode;
  subtitle?: string;
  trend?: { value: string; direction: "up" | "down" | "neutral" };
  progress?: number;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export function KPIBlock({ title, value, subtitle, trend, progress, variant = "default", className, ...props }: KPIBlockProps) {
  const variantStyles = {
    default: "border-border/60 bg-surface",
    primary: "border-primary/20 bg-primary-subtle",
    success: "border-success/20 bg-success-subtle",
    warning: "border-warning/20 bg-warning-subtle",
    danger: "border-danger/20 bg-danger-subtle",
  };
  const trendColors = { up: "text-success", down: "text-danger", neutral: "text-text-muted" };
  const trendIcons = { up: "\u2191", down: "\u2193", neutral: "\u2192" };

  return (
    <div className={cn("rounded-card border p-5 space-y-2", variantStyles[variant], className)} {...props}>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      <p className="text-3xl font-bold tracking-tight text-text">{value}</p>
      {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      {trend && (
        <p className={cn("flex items-center gap-1 text-sm font-medium", trendColors[trend.direction])}>
          <span>{trendIcons[trend.direction]}</span>
          {trend.value}
        </p>
      )}
      {progress !== undefined && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-tertiary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${String(Math.min(100, Math.max(0, progress)))}%` }} />
        </div>
      )}
    </div>
  );
}
