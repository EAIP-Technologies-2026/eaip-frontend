"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { EnterpriseIcon } from "@eaip/icons";
import { Spinner } from "./spinner";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  circle?: boolean;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ circle, width, height, className = "", ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={["bg-surface-tertiary animate-pulse rounded", circle && "rounded-full", className]
        .filter(Boolean)
        .join(" ")}
      style={{ width, height }}
      aria-hidden="true"
      {...props}
    />
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
