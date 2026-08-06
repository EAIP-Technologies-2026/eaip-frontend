"use client";

import type { HTMLAttributes } from "react";
import { EnterpriseIcon } from "@eaip/icons";

export interface NavItemData {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  badge?: string;
  active?: boolean;
  disabled?: boolean;
}

export interface NavigationGroupData {
  id: string;
  title?: string;
  items: NavItemData[];
}

export interface NavigationItemsProps extends Omit<HTMLAttributes<HTMLUListElement>, "onSelect"> {
  items: NavItemData[];
  onSelect?: (item: NavItemData) => void;
}

export function NavigationItems({
  items,
  onSelect,
  className = "",
  ...props
}: NavigationItemsProps) {
  return (
    <ul data-slot="navigation-items" className={`space-y-1 ${className}`} {...props}>
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled && onSelect) onSelect(item);
            }}
            aria-current={item.active ? "page" : undefined}
            data-slot="navigation-item"
            data-state={item.active ? "active" : "inactive"}
            className={[
              "rounded-button focus:ring-primary flex w-full items-center justify-between px-3 py-2 text-xs font-medium transition-colors focus:ring-2 focus:outline-none md:text-sm",
              item.active
                ? "bg-primary-subtle text-primary font-semibold"
                : "text-text-secondary hover:bg-surface-tertiary hover:text-text",
              item.disabled && "cursor-not-allowed opacity-50",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {item.icon ? (
                <EnterpriseIcon name={item.icon as never} size={18} className="shrink-0" />
              ) : null}
              <span className="truncate">{item.label}</span>
            </div>
            {item.badge ? (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold">
                {item.badge}
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );
}

export interface NavigationGroupsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  groups: NavigationGroupData[];
  onSelect?: (item: NavItemData) => void;
}

export function NavigationGroups({
  groups,
  onSelect,
  className = "",
  ...props
}: NavigationGroupsProps) {
  return (
    <div data-slot="navigation-groups" className={`space-y-4 ${className}`} {...props}>
      {groups.map((group) => (
        <div key={group.id} className="space-y-1.5">
          {group.title ? (
            <h4 className="text-text-muted px-3 text-[10px] font-bold tracking-wider uppercase">
              {group.title}
            </h4>
          ) : null}
          <NavigationItems items={group.items} onSelect={onSelect} />
        </div>
      ))}
    </div>
  );
}

export interface ContextNavigationProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  title: string;
  items: NavItemData[];
  onSelect?: (item: NavItemData) => void;
}

export function ContextNavigation({
  title,
  items,
  onSelect,
  className = "",
  ...props
}: ContextNavigationProps) {
  return (
    <nav
      aria-label={title}
      data-slot="context-navigation"
      className={`rounded-card border-border bg-surface border p-3 ${className}`}
      {...props}
    >
      <h3 className="text-text-muted mb-2 px-2 text-xs font-semibold tracking-wider uppercase">
        {title}
      </h3>
      <NavigationItems items={items} onSelect={onSelect} />
    </nav>
  );
}
