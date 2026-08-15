import type { HTMLAttributes, ReactNode } from "react";
import { EnterpriseIcon, type IconName } from "@eaip/icons";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
} from "recharts";

export {
  ChartContainer,
  ChartLegend as ChartLegendInfrastructure,
  ChartTooltip,
} from "./chart-infrastructure";
export type {
  ChartContainerProps,
  ChartLegendProps as ChartLegendInfrastructureProps,
  ChartTooltipProps,
} from "./chart-infrastructure";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  variant = "default",
  label,
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };
  const variants = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <div className={["w-full", className].filter(Boolean).join(" ")} {...props}>
      {label != null && (
        <div className="text-text-secondary mb-1.5 flex items-center justify-between text-xs">
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={["bg-surface-tertiary w-full overflow-hidden rounded-full", sizes[size]].join(
          " ",
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={["h-full rounded-full transition-all duration-500", variants[variant]].join(
            " ",
          )}
          style={{ width: `${String(percentage)}%` }}
        />
      </div>
    </div>
  );
}

export interface StatusRingProps extends HTMLAttributes<HTMLDivElement> {
  status: "idle" | "running" | "success" | "warning" | "error";
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusRing({ status, pulse, size = "md", className, ...props }: StatusRingProps) {
  const colors = {
    idle: "bg-text-muted",
    running: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-danger",
  };
  const sizes = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };
  return (
    <span
      className={[
        "inline-block rounded-full",
        colors[status],
        sizes[size],
        pulse && status === "running" && "animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`Status: ${status}`}
      {...props}
    />
  );
}

export interface SparklineProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  color = "var(--color-primary)",
  height = 80,
  className,
}: SparklineProps) {
  return (
    <div className={["w-full", className].filter(Boolean).join(" ")} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#sparklineFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface BarChartProps {
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
  className?: string;
}

export function BarChartWidget({
  data,
  color = "var(--color-primary)",
  height = 200,
  className,
}: BarChartProps) {
  return (
    <div className={["w-full", className].filter(Boolean).join(" ")} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-subtle)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--color-surface-tertiary)", radius: 4 }}
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-button)",
              boxShadow: "var(--shadow-elevated)",
              fontSize: 13,
            }}
            itemStyle={{ color: "var(--color-text)", fontWeight: 500 }}
          />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  className?: string;
}

export function PieChartWidget({ data, height = 200, className }: PieChartProps) {
  const defaultColors = [
    "var(--color-primary)",
    "var(--color-success)",
    "var(--color-warning)",
    "var(--color-danger)",
    "var(--color-text-muted)",
  ];
  const nonzero = data.filter((entry) => entry.value > 0);
  const coloredData = nonzero.map((entry, index) => ({
    ...entry,
    fill: entry.color ?? defaultColors[index % defaultColors.length],
  }));
  return (
    <div className={["w-full", className].filter(Boolean).join(" ")} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={coloredData}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={coloredData.length > 1 ? 2 : 0}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-button)",
              boxShadow: "var(--shadow-elevated)",
              fontSize: 13,
            }}
            itemStyle={{ color: "var(--color-text)", fontWeight: 500 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  change?: string;
  changeDirection?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  sparklineData?: { label: string; value: number }[];
}

export function MetricCard({
  label,
  value,
  change,
  changeDirection = "neutral",
  icon,
  sparklineData,
  className,
  ...props
}: MetricCardProps) {
  const changeColor = {
    up: "text-success",
    down: "text-danger",
    neutral: "text-text-muted",
  }[changeDirection];
  return (
    <div
      data-slot="metric-card"
      className={["surface-card card-hover-lift flex flex-col justify-between p-5", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium">{label}</p>
          <div className="text-text mt-1 text-2xl font-semibold tracking-tight font-tabular tabular-nums">{value}</div>
          {change && (
            <div
              className={["mt-1 flex items-center gap-1 text-xs font-medium", changeColor].join(
                " ",
              )}
            >
              <span>{changeDirection === "up" ? "↑" : changeDirection === "down" ? "↓" : "—"}</span>
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className="bg-primary-subtle/80 text-primary flex h-10 w-10 items-center justify-center rounded-xl shadow-sm">
            {typeof icon === "string" ? <EnterpriseIcon name={icon as IconName} size={18} aria-hidden="true" /> : icon}
          </div>
        )}
      </div>
      {sparklineData && (
        <div className="mt-4">
          <Sparkline data={sparklineData} height={48} />
        </div>
      )}
    </div>
  );
}

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "idle" | "running" | "success" | "warning" | "error";
}

export interface TimelineProps extends HTMLAttributes<HTMLOListElement> {
  items: TimelineItem[];
}

export function Timeline({ items, className, ...props }: TimelineProps) {
  return (
    <ol
      className={["relative border-l border-border pl-6 space-y-6", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[31px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-surface ring-4 ring-surface-secondary">
            <StatusRing status={item.status ?? "idle"} size="sm" />
          </span>
          <div>
            <h4 className="text-sm font-semibold text-text">{item.title}</h4>
            {item.description && (
              <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
            )}
            <time className="text-[11px] text-text-muted mt-1 block font-mono">{item.timestamp}</time>
          </div>
        </li>
      ))}
    </ol>
  );
}

export interface StatusWidgetProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  status: "idle" | "running" | "success" | "warning" | "error";
  description?: string;
  metrics?: { label: string; value: string | number }[];
}

export function StatusWidget({
  title,
  status,
  description,
  metrics,
  className,
  ...props
}: StatusWidgetProps) {
  return (
    <div
      className={["surface-card p-5 space-y-4", className].filter(Boolean).join(" ")}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <StatusRing status={status} pulse={status === "running"} size="md" />
          <h3 className="font-semibold text-text text-sm">{title}</h3>
        </div>
      </div>
      {description && <p className="text-xs text-text-secondary">{description}</p>}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="text-[11px] text-text-muted uppercase tracking-wider">{m.label}</div>
              <div className="text-sm font-semibold text-text font-tabular tabular-nums">{m.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
