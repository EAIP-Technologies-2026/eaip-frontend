import { EnterpriseIcon } from "@eaip/icons";
import { cn } from "@eaip/utilities";
import { Button } from "@eaip/ui-primitives";
import { MathematicalLoader } from "./magic-ui";

export interface LoadingStateProps {
  message?: string;
  className?: string;
  variant?: "spinner" | "skeleton";
}

export interface SkeletonRowProps {
  columns?: number;
  className?: string;
}

export function SkeletonRow({ columns = 4, className }: SkeletonRowProps) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      {Array.from({ length: columns }, (_, i) => (
        <div
          key={i}
          className={cn(
            "skeleton h-4 rounded",
            i === 0 ? "w-1/3" : "flex-1",
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("skeleton-card", className)}>
      <div className="space-y-3">
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function SkeletonBentoGrid({ className }: { className?: string }) {
  return (
    <div className={cn("bento-grid", className)}>
      <div className="bento-grid-item lg:col-span-2">
        <div className="space-y-3">
          <div className="skeleton h-4 w-1/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-8 w-1/3 rounded mt-4" />
        </div>
      </div>
      <div className="bento-grid-item">
        <div className="space-y-3">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-8 w-1/2 rounded" />
        </div>
      </div>
      <div className="bento-grid-item">
        <div className="space-y-3">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-8 w-1/2 rounded" />
        </div>
      </div>
      <div className="bento-grid-item lg:col-span-2">
        <div className="space-y-3">
          <div className="skeleton h-4 w-1/4 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
      </div>
      <div className="bento-grid-item">
        <div className="space-y-3">
          <div className="skeleton h-4 w-1/3 rounded" />
          <div className="skeleton h-8 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}

export function LoadingState({
  message = "Loading...",
  className,
  variant = "spinner",
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return <SkeletonBentoGrid className={className} />;
  }

  return (
    <div
      className={cn(
        "page-enter flex flex-col items-center justify-center gap-4 rounded-card p-10",
        className,
      )}
    >
      <MathematicalLoader size="lg" label={message} />
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "glass flex flex-col items-center justify-center gap-4 rounded-card border p-10",
        className,
      )}
    >
      <div className="rounded-full bg-danger-subtle p-3 text-danger shadow-sm">
        <EnterpriseIcon name="alert" size={24} />
      </div>
      <h3 className="text-base font-medium text-text">{title}</h3>
      <p className="max-w-xs text-center text-sm text-text-secondary">{message}</p>
      {onRetry ? (
        <Button
          type="button"
          onClick={onRetry}
          iconLeft="refresh"
          variant="secondary"
        >
          Try again
        </Button>
      ) : null}
    </div>
  );
}
