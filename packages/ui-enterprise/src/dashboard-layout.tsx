import type { ReactNode, HTMLAttributes } from "react";
import { EnterpriseIcon } from "@eaip/icons";
import { cn } from "@eaip/core";

export interface DashboardLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  sidebar?: ReactNode;
  sidebarWidth?: string;
}

export function DashboardLayout({ children, sidebar, sidebarWidth = "w-72", className, ...props }: DashboardLayoutProps) {
  return (
    <div className={cn("flex gap-6", className)} {...props}>
      {sidebar && (
        <aside className={cn("hidden lg:block shrink-0", sidebarWidth)}>
          {sidebar}
        </aside>
      )}
      <div className="flex-1 min-w-0 space-y-6">
        {children}
      </div>
    </div>
  );
}

export interface DashboardSectionProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export function DashboardSection({ title, description, action, children, className, ...props }: DashboardSectionProps) {
  return (
    <section className={cn("space-y-4", className)} {...props}>
      {(title ?? action) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold text-text">{title}</h2>}
            {description && <p className="text-sm text-text-muted mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export interface DashboardGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export function DashboardGrid({ children, columns = 2, className, ...props }: DashboardGridProps) {
  const gridCols = { 1: "grid-cols-1", 2: "grid-cols-1 lg:grid-cols-2", 3: "grid-cols-1 lg:grid-cols-3" };
  return (
    <div className={cn("grid gap-6", gridCols[columns], className)} {...props}>
      {children}
    </div>
  );
}

export interface MetricComparisonProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  current: string;
  previous: string;
  format?: "number" | "percentage";
  variant?: "default" | "success" | "warning" | "danger";
}

export function MetricComparison({ label, current, previous, variant = "default", className, ...props }: MetricComparisonProps) {
  const variantStyles = {
    default: "border-border bg-surface",
    success: "border-success/20 bg-success-subtle",
    warning: "border-warning/20 bg-warning-subtle",
    danger: "border-danger/20 bg-danger-subtle",
  };
  return (
    <div className={cn("rounded-card border p-4", variantStyles[variant], className)} {...props}>
      <p className="text-sm font-medium text-text-secondary mb-3">{label}</p>
      <div className="flex items-baseline gap-3">
        <div>
          <p className="text-xs text-text-muted mb-0.5">Current</p>
          <p className="text-xl font-semibold text-text">{current}</p>
        </div>
        <div className="text-text-muted">vs</div>
        <div>
          <p className="text-xs text-text-muted mb-0.5">Previous</p>
          <p className="text-xl font-semibold text-text">{previous}</p>
        </div>
      </div>
    </div>
  );
}

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string;
  title: string;
}

export function SectionHeader({ icon, title, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      {icon && (
        <EnterpriseIcon name={icon as never} size={16} className="text-text-secondary" />
      )}
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
        {title}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}