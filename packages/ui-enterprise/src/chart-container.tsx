import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";
import { Spinner } from "@eaip/ui-primitives";

export interface ChartContainerProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  height?: number;
  loading?: boolean;
}

export function ChartContainer({ title, description, action, children, height = 300, loading = false, className, ...props }: ChartContainerProps) {
  return (
    <div className={cn("rounded-card border border-border bg-surface p-5 transition-smooth", className)} {...props}>
      {(title ?? action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-text">{title}</h3>}
            {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div style={{ height }} className="relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" className="text-primary" />
              <p className="text-xs text-text-muted">Loading chart...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
