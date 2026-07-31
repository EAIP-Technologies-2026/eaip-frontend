import type { HTMLAttributes } from "react";
import { cn } from "@eaip/core";

export type PaginationSize = "sm" | "md" | "lg";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  size?: PaginationSize;
  maxVisible?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
}

const sizeStyles: Record<PaginationSize, { button: string; text: string; icon: number }> = {
  sm: { button: "h-7 min-w-[1.75rem] text-xs px-1.5", text: "text-xs", icon: 14 },
  md: { button: "h-8 min-w-[2rem] text-sm px-2", text: "text-sm", icon: 16 },
  lg: { button: "h-10 min-w-[2.5rem] text-base px-3", text: "text-base", icon: 18 },
};

function getVisiblePages(current: number, total: number, maxVisible: number): (number | "ellipsis")[] {
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, current + half);

  if (current - half <= 1) {
    end = Math.min(total, maxVisible);
  }
  if (current + half >= total) {
    start = Math.max(1, total - maxVisible + 1);
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("ellipsis");
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < total) {
    if (end < total - 1) pages.push("ellipsis");
    pages.push(total);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onChange,
  size = "md",
  maxVisible = 7,
  showFirstLast = true,
  showPrevNext = true,
  className,
  ...props
}: PaginationProps) {
  const styles = sizeStyles[size];
  const pages = getVisiblePages(currentPage, totalPages, maxVisible);

  return (
    <div className={cn("flex items-center justify-center gap-1", className)} {...props}>
      {showFirstLast && (
        <button
          type="button"
          onClick={() => { onChange(1); }}
          disabled={currentPage <= 1}
          className={cn(
            styles.button,
            "rounded-button text-text-secondary transition-smooth hover:bg-surface-tertiary disabled:opacity-40",
          )}
          aria-label="First page"
        >
          <svg width={styles.icon} height={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 18l-6-6 6-6M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {showPrevNext && (
        <button
          type="button"
          onClick={() => { onChange(Math.max(1, currentPage - 1)); }}
          disabled={currentPage <= 1}
          className={cn(
            styles.button,
            "rounded-button text-text-secondary transition-smooth hover:bg-surface-tertiary disabled:opacity-40",
          )}
          aria-label="Previous page"
        >
          <svg width={styles.icon} height={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {pages.map((page, idx) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${String(idx)}`} className={cn(styles.text, "px-1 text-text-muted")}>&hellip;</span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => { onChange(page); }}
            className={cn(
              styles.button,
              "rounded-button font-medium transition-smooth",
              page === currentPage
                ? "bg-primary text-text-inverse shadow-sm"
                : "text-text-secondary hover:bg-surface-tertiary hover:text-text",
            )}
            aria-current={page === currentPage ? "page" : undefined}
            aria-label={`Page ${String(page)}`}
          >
            {page}
          </button>
        ),
      )}
      {showPrevNext && (
        <button
          type="button"
          onClick={() => { onChange(Math.min(totalPages, currentPage + 1)); }}
          disabled={currentPage >= totalPages}
          className={cn(
            styles.button,
            "rounded-button text-text-secondary transition-smooth hover:bg-surface-tertiary disabled:opacity-40",
          )}
          aria-label="Next page"
        >
          <svg width={styles.icon} height={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {showFirstLast && (
        <button
          type="button"
          onClick={() => { onChange(totalPages); }}
          disabled={currentPage >= totalPages}
          className={cn(
            styles.button,
            "rounded-button text-text-secondary transition-smooth hover:bg-surface-tertiary disabled:opacity-40",
          )}
          aria-label="Last page"
        >
          <svg width={styles.icon} height={styles.icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 18l6-6-6-6M13 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
