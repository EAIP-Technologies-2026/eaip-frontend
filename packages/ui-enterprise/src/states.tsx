import { EnterpriseIcon } from "@eaip/icons";
import { cn } from "@eaip/utilities";
import { Button, Spinner } from "@eaip/ui-primitives";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export interface SkeletonRowProps {
  columns?: number;
  className?: string;
}

export function SkeletonRow({ columns = 4, className }: SkeletonRowProps) {
  return (
    <div className={cn("flex items-center gap-4 py-3", className)}>
      {Array.from({ length: columns }, (_, i) => (
        <div key={i} className={cn("skeleton h-4", i === 0 ? "w-1/3" : "flex-1")} />
      ))}
    </div>
  );
}

export function LoadingState({ message = "Loading...", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "page-enter flex flex-col items-center justify-center gap-4 rounded-card p-10",
        className,
      )}
    >
      <Spinner size="lg" className="text-primary" />
      <p className="text-sm text-text-secondary">{message}</p>
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
        <Button type="button" onClick={onRetry} iconLeft="refresh" variant="secondary">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
