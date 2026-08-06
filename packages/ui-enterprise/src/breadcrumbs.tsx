"use client";

import { EnterpriseIcon } from "./icon";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

export interface BreadcrumbsProps {
  /** Array of breadcrumb path items */
  items: BreadcrumbItem[];
  /** Callback fired when a breadcrumb link is clicked */
  onNavigate?: (href: string) => void;
  /** Additional CSS class names */
  className?: string;
}

export function Breadcrumbs({ items, onNavigate, className = "" }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`text-text-secondary text-xs md:text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5 md:gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${String(index)}`}
              className="flex items-center gap-1.5 md:gap-2"
            >
              {index > 0 ? (
                <EnterpriseIcon
                  name="chevronRight"
                  size={14}
                  className="text-text-muted shrink-0"
                  aria-hidden="true"
                />
              ) : null}

              {item.href && !isLast ? (
                <a
                  href={item.href}
                  onClick={(e) => {
                    if (onNavigate && item.href) {
                      e.preventDefault();
                      onNavigate(item.href);
                    }
                  }}
                  className="rounded-button hover:text-text focus:ring-primary transition-colors hover:underline focus:ring-2 focus:outline-none"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={`truncate font-medium ${isLast ? "text-text" : "text-text-secondary"}`}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
