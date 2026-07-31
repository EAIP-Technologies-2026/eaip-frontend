import type { HTMLAttributes } from "react";
import { cn } from "@eaip/core";
import { Badge } from "@eaip/ui-primitives";

export interface HealthMetric {
  id: string;
  label: string;
  value: string;
  status: "healthy" | "warning" | "critical";
  threshold?: string;
}

export interface HealthWidgetProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  overall: "healthy" | "warning" | "critical";
  metrics: HealthMetric[];
}

const statusConfig = {
  healthy: { icon: "✓", color: "text-success", bg: "bg-success-subtle", badge: "success" as const },
  warning: { icon: "!", color: "text-warning", bg: "bg-warning-subtle", badge: "warning" as const },
  critical: { icon: "✕", color: "text-danger", bg: "bg-danger-subtle", badge: "danger" as const },
};

export function HealthWidget({ title = "System Health", overall, metrics, className, ...props }: HealthWidgetProps) {
  const overallCfg = statusConfig[overall];
  return (
    <div className={cn("rounded-card border border-border bg-surface p-5", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", overallCfg.bg, overallCfg.color)}>
          <span>{overallCfg.icon}</span>
          <span className="capitalize">{overall}</span>
        </div>
      </div>
      <ul className="space-y-3">
        {metrics.map((metric) => {
          const cfg = statusConfig[metric.status];
          return (
            <li key={metric.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold", cfg.bg, cfg.color)}>
                  {cfg.icon}
                </span>
                <div>
                  <span className="text-sm text-text">{metric.label}</span>
                  {metric.threshold && <span className="text-xs text-text-muted ml-1">(threshold: {metric.threshold})</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text">{metric.value}</span>
                <Badge variant={cfg.badge}>{metric.status}</Badge>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}