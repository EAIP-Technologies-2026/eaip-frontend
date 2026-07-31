import type { InputHTMLAttributes } from "react";
import { forwardRef, useCallback } from "react";
import { cn } from "@eaip/core";

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, ...props }, ref) => {
    const hasValue = props.value !== undefined && props.value !== "";

    const handleClear = useCallback(() => {
      onClear?.();
    }, [onClear]);



    return (
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <input
          ref={ref}
          type="search"
          className={cn(
            "block w-full rounded-input border bg-surface py-2.5 pl-10 pr-10 text-sm text-text shadow-sm transition-smooth",
            "border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
            "placeholder:text-text-muted",
            className,
          )}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-muted transition-smooth hover:text-text"
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";