import Link from "next/link";
import { EnterpriseIcon } from "@eaip/icons";
import type { Breadcrumb } from "./types";

export interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${String(index)}`} className="flex items-center gap-2">
            {index > 0 ? <EnterpriseIcon name="chevronRight" size={14} className="text-text-muted" /> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="transition-smooth hover:text-text hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-text">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
