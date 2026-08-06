"use client";

import type { ReactNode, HTMLAttributes } from "react";

export interface ChartContainerProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}

export function ChartContainer({
  title,
  subtitle,
  children,
  action,
  className = "",
  ...props
}: ChartContainerProps) {
  return (
    <div
      data-slot="chart-container"
      className={`rounded-card border-border bg-surface shadow-card border p-5 ${className}`}
      {...props}
    >
      {title || action ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            {title ? (
              <h3 className="text-text text-base font-semibold tracking-tight">{title}</h3>
            ) : null}
            {subtitle ? <p className="text-text-secondary text-xs">{subtitle}</p> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </div>
      ) : null}
      <div className="relative w-full overflow-hidden">{children}</div>
    </div>
  );
}

export interface ChartLegendItem {
  id: string;
  label: string;
  color: string;
}

export interface ChartLegendProps extends HTMLAttributes<HTMLDivElement> {
  items: ChartLegendItem[];
}

export function ChartLegend({ items, className = "", ...props }: ChartLegendProps) {
  return (
    <div
      data-slot="chart-legend"
      className={`flex flex-wrap items-center gap-4 text-xs ${className}`}
      {...props}
    >
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-text-secondary font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export interface ChartTooltipProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  color?: string;
  visible?: boolean;
}

export function ChartTooltip({
  label,
  value,
  color = "#3b82f6",
  visible = true,
  className = "",
  ...props
}: ChartTooltipProps) {
  if (!visible) return null;

  return (
    <div
      data-slot="chart-tooltip"
      className={`rounded-card border-border bg-surface/90 shadow-elevated z-50 border px-3 py-2 text-xs backdrop-blur-md ${className}`}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-text-muted font-medium">{label}:</span>
        <span className="text-text font-bold">{value}</span>
      </div>
    </div>
  );
}
