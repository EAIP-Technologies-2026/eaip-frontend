import Link from "next/link";
import type { Breadcrumb } from "./types";

export interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.label}-${String(index)}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-gray-300">/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-gray-900 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
