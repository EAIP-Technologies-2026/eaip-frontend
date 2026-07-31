import type { ReactNode, InputHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@eaip/core";

export interface InputGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  prefix?: ReactNode;
  suffix?: ReactNode;
  error?: boolean;
}

export const InputGroup = forwardRef<HTMLInputElement, InputGroupProps>(
  ({ prefix, suffix, error, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {prefix && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 flex items-center pl-3 text-text-muted">
            {typeof prefix === "string" ? (
              <span className="text-sm font-medium text-text-muted">{prefix}</span>
            ) : (
              prefix
            )}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "block w-full rounded-input border bg-surface px-3 py-2.5 text-sm text-text shadow-sm transition-smooth",
            "border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
            "placeholder:text-text-muted",
            error && "border-danger focus:border-danger focus:ring-danger",
            prefix && "pl-10",
            suffix && "pr-10",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          {...props}
        />
        {suffix && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex items-center pr-3 text-text-muted">
            {typeof suffix === "string" ? (
              <span className="text-sm font-medium text-text-muted">{suffix}</span>
            ) : (
              suffix
            )}
          </div>
        )}
      </div>
    );
  },
);
InputGroup.displayName = "InputGroup";