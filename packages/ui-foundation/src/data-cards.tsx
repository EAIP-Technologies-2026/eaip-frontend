"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { EnterpriseIcon } from "@eaip/icons";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "outlined" | "glass";
}

export function Card({ children, variant = "default", className = "", ...props }: CardProps) {
  const variantStyles = {
    default: "bg-surface border-border/60 shadow-card",
    outlined: "bg-transparent border-border",
    glass: "glass text-text",
  };

  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={`rounded-card transition-smooth border p-5 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: ReactNode;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: string;
  badge?: ReactNode;
}

export function MetricCard({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  badge,
  className = "",
  ...props
}: MetricCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-danger",
    neutral: "text-text-muted",
  };

  const trendIcons = {
    up: "trendingUp",
    down: "trendingDown",
    neutral: "minus",
  };

  return (
    <Card data-slot="metric-card" className={className} {...props}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-text-muted text-xs font-semibold tracking-wider uppercase">
          {title}
        </span>
        {icon ? (
          <div className="bg-surface-tertiary text-text-muted flex h-8 w-8 items-center justify-center rounded-lg">
            <EnterpriseIcon name={icon as never} size={16} />
          </div>
        ) : badge ? (
          <div>{badge}</div>
        ) : null}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-text text-2xl font-bold tracking-tight md:text-3xl">{value}</span>
        {change ? (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColors[trend]}`}>
            <EnterpriseIcon name={trendIcons[trend] as never} size={14} />
            <span>{change}</span>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export const StatCard = MetricCard;

export interface InfoCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: ReactNode;
  icon?: string;
  action?: ReactNode;
}

export function InfoCard({
  title,
  description,
  icon,
  action,
  className = "",
  ...props
}: InfoCardProps) {
  return (
    <Card data-slot="info-card" className={className} {...props}>
      <div className="flex items-start gap-4">
        {icon ? (
          <div className="bg-primary-subtle text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <EnterpriseIcon name={icon as never} size={20} />
          </div>
        ) : null}
        <div className="flex-1">
          <h3 className="text-text text-base font-semibold">{title}</h3>
          <div className="text-text-secondary mt-1 text-sm">{description}</div>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </Card>
  );
}
