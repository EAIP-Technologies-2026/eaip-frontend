/* eslint-disable @typescript-eslint/no-deprecated */
import type { HTMLAttributes } from "react";
import { cn } from "@eaip/core";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";

const tooltipStyle = {
  backgroundColor: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)",
  padding: "8px 12px",
};
const labelStyle = { color: "var(--color-text-muted)", fontSize: 11, fontWeight: 500, letterSpacing: "0.02em" };
const itemStyle = { color: "var(--color-text)", fontSize: 12, fontWeight: 600 };

export interface LineChartWidgetProps {
  data: { name: string; value: number; value2?: number }[];
  lines: { dataKey: string; color?: string; label?: string }[];
  height?: number;
  className?: string;
}

export function LineChartWidget({ data, lines, height = 200, className }: LineChartWidgetProps) {
  const colors = ["var(--color-primary)", "var(--color-success)", "var(--color-warning)", "var(--color-danger)"];
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} strokeOpacity={0.5} />
          <XAxis dataKey="name" tick={labelStyle} axisLine={false} tickLine={false} />
          <YAxis tick={labelStyle} axisLine={false} tickLine={false} />
          <RechartsTooltip contentStyle={tooltipStyle} itemStyle={itemStyle} labelStyle={labelStyle} />
          {lines.map((line, i) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color ?? colors[i % colors.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, fill: "var(--color-surface-elevated)" }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface AreaChartWidgetProps {
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
  stacked?: boolean;
  className?: string;
}

export function AreaChartWidget({ data, color = "var(--color-primary)", height = 200, stacked = false, className }: AreaChartWidgetProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.20} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} strokeOpacity={0.5} />
          <XAxis dataKey="name" tick={labelStyle} axisLine={false} tickLine={false} />
          <YAxis tick={labelStyle} axisLine={false} tickLine={false} />
          <RechartsTooltip contentStyle={tooltipStyle} itemStyle={itemStyle} labelStyle={labelStyle} />
          <Area type="monotone" dataKey="value" stroke={color} fill="url(#areaFill)" strokeWidth={2} stackId={stacked ? "1" : undefined} />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface HorizontalBarChartWidgetProps {
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
  className?: string;
}

export function HorizontalBarChartWidget({ data, color = "var(--color-primary)", height = 200, className }: HorizontalBarChartWidgetProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} strokeOpacity={0.5} />
          <XAxis type="number" tick={labelStyle} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={labelStyle} axisLine={false} tickLine={false} />
          <RechartsTooltip contentStyle={tooltipStyle} itemStyle={itemStyle} labelStyle={labelStyle} />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface GaugeWidgetProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
}

const gaugeColors = {
  default: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
};

const gaugeSizes = {
  sm: { outerRadius: 60, innerRadius: 50, textSize: "text-lg" },
  md: { outerRadius: 80, innerRadius: 65, textSize: "text-2xl" },
  lg: { outerRadius: 100, innerRadius: 80, textSize: "text-3xl" },
};

export function GaugeWidget({ value, max = 100, label, size = "md", variant = "default", className, ...props }: GaugeWidgetProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const dims = gaugeSizes[size];
  const data = [{ name: "Progress", value: percentage, fill: gaugeColors[variant] }];

  return (
    <div className={cn("flex flex-col items-center", className)} {...props}>
      <div style={{ height: dims.outerRadius * 2, width: dims.outerRadius * 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius={dims.innerRadius} outerRadius={dims.outerRadius} barSize={10} data={data} startAngle={180} endAngle={0}>
            <RadialBar dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className={cn("font-bold text-text mt-1", dims.textSize)}>{Math.round(percentage)}%</div>
      {label && <p className="text-sm text-text-muted">{label}</p>}
    </div>
  );
}

export interface DonutChartWidgetProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

export function DonutChartWidget({ data, height = 200, innerRadius = 60, outerRadius = 90, className }: DonutChartWidgetProps) {
  const defaultColors = ["var(--color-primary)", "var(--color-success)", "var(--color-warning)", "var(--color-danger)", "var(--color-text-muted)"];
  return (
    <div className={cn("w-full flex justify-center", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={entry.color ?? defaultColors[index % defaultColors.length]} />
            ))}
          </Pie>
          <RechartsTooltip contentStyle={tooltipStyle} itemStyle={itemStyle} labelStyle={labelStyle} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface ChartLegendProps extends HTMLAttributes<HTMLUListElement> {
  items: { label: string; color: string }[];
}

export function ChartLegend({ items, className, ...props }: ChartLegendProps) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-4", className)} {...props}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
