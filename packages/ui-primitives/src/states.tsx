"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { EnterpriseIcon } from "@eaip/icons";
import { Spinner } from "./spinner";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  circle?: boolean;
  width?: string | number;
  height?: string | number;
  shimmer?: boolean;
  variant?: "default" | "glass" | "text" | "card" | "circular";
}

export function Skeleton({
  circle,
  width,
  height,
  shimmer = true,
  variant = "default",
  className = "",
  ...props
}: SkeletonProps) {
  const isCircle = circle ?? variant === "circular";
  return (
    <div
      data-slot="skeleton"
      className={[
        "bg-surface-tertiary/80 relative overflow-hidden rounded-md transition-opacity",
        shimmer && "eaip-shimmer animate-pulse",
        variant === "glass" && "bg-surface-glass border-border/40 border backdrop-blur-md",
        variant === "card" && "rounded-card border-border/50 bg-surface/60 border",
        variant === "text" && "my-1 h-4 rounded",
        isCircle && "rounded-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width, height }}
      aria-hidden="true"
      {...props}
    />
  );
}

export interface CardSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
  hasHeader?: boolean;
}

export function CardSkeleton({
  lines = 3,
  hasHeader = true,
  className = "",
  ...props
}: CardSkeletonProps) {
  return (
    <div
      data-slot="card-skeleton"
      className={`rounded-card border-border/60 bg-surface/70 space-y-4 border p-5 shadow-sm backdrop-blur-sm ${className}`}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={36} height={36} />
            <div className="space-y-1.5">
              <Skeleton width={120} height={16} />
              <Skeleton width={80} height={12} />
            </div>
          </div>
          <Skeleton width={48} height={20} className="rounded-full" />
        </div>
      )}
      <div className="space-y-2 pt-1">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} width={i === lines - 1 ? "65%" : "100%"} height={14} />
        ))}
      </div>
    </div>
  );
}

export interface TableSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = "",
  ...props
}: TableSkeletonProps) {
  return (
    <div
      data-slot="table-skeleton"
      className={`rounded-card border-border/60 bg-surface/60 w-full overflow-hidden border backdrop-blur-sm ${className}`}
      {...props}
    >
      <div className="border-border/60 bg-surface-secondary/50 flex items-center gap-4 border-b px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={i === 0 ? "30%" : "20%"} height={16} />
        ))}
      </div>
      <div className="divide-border/40 divide-y">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} width={c === 0 ? "35%" : "18%"} height={14} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface PageSkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: boolean;
  statCards?: number;
}

export function PageSkeleton({
  title = true,
  statCards = 4,
  className = "",
  ...props
}: PageSkeletonProps) {
  return (
    <div
      data-slot="page-skeleton"
      className={`mx-auto max-w-7xl space-y-6 p-6 ${className}`}
      {...props}
    >
      {title && (
        <div className="border-border/40 flex items-center justify-between border-b pb-2">
          <div className="space-y-2">
            <Skeleton width={220} height={28} />
            <Skeleton width={320} height={16} />
          </div>
          <div className="flex gap-2">
            <Skeleton width={96} height={36} className="rounded-button" />
            <Skeleton width={96} height={36} className="rounded-button" />
          </div>
        </div>
      )}
      {statCards > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: statCards }).map((_, i) => (
            <CardSkeleton key={i} lines={1} hasHeader />
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TableSkeleton rows={6} columns={4} />
        </div>
        <div>
          <CardSkeleton lines={6} hasHeader />
        </div>
      </div>
    </div>
  );
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className = "",
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={[
        "rounded-card border-border bg-surface flex flex-col items-center justify-center border border-dashed p-8 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <div className="bg-surface-tertiary text-text-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
        <EnterpriseIcon name={icon as never} size={24} />
      </div>
      <h3 className="text-text text-base font-semibold">{title}</h3>
      {description ? (
        <p className="text-text-secondary mt-1 max-w-sm text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export function LoadingState({
  message = "Loading data...",
  className = "",
  ...props
}: LoadingStateProps) {
  return (
    <div
      data-slot="loading-state"
      className={`flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}
      {...props}
    >
      <Spinner size="lg" className="text-primary" />
      <p className="text-text-secondary text-sm font-medium">{message}</p>
    </div>
  );
}

export interface ErrorStateProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Failed to load content",
  description = "An error occurred while fetching resource details. Please try again.",
  onRetry,
  className = "",
  ...props
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      className={`rounded-card border-danger/20 bg-danger-subtle/30 flex flex-col items-center justify-center border p-8 text-center ${className}`}
      {...props}
    >
      <div className="bg-danger-subtle text-danger mb-3 flex h-12 w-12 items-center justify-center rounded-full">
        <EnterpriseIcon name={"alertCircle" as never} size={24} />
      </div>
      <h3 className="text-text text-base font-semibold">{title}</h3>
      <p className="text-text-secondary mt-1 max-w-sm text-sm">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-button bg-surface border-border text-text hover:bg-surface-tertiary focus:ring-primary mt-4 border px-4 py-2 text-xs font-semibold focus:ring-2 focus:outline-none"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
