import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";

export interface SidebarItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  href?: string;
  badge?: ReactNode;
  disabled?: boolean;
  children?: SidebarItem[];
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  items: SidebarItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Sidebar({
  items,
  activeId,
  onNavigate,
  collapsible = false,
  collapsed = false,
  onCollapse,
  header,
  footer,
  className,
  ...props
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col bg-surface-secondary border-r border-border h-full transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className,
      )}
      {...props}
    >
      {header && (
        <div className={cn("border-b border-border px-4 py-4", collapsed && "px-3")}>
          {header}
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {items.map((item) => {
          const active = item.id === activeId;
          const itemContent = (
            <button
              type="button"
              onClick={() => { onNavigate(item.id); }}
              disabled={item.disabled}
              className={cn(
                "flex w-full items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition-smooth",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                collapsed && "justify-center px-2",
                active
                  ? "bg-primary text-text-inverse shadow-sm"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text",
              )}
              title={collapsed && typeof item.label === "string" ? item.label : undefined}
            >
              {item.icon && <span className="shrink-0 w-5 h-5">{item.icon}</span>}
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge}
                </>
              )}
            </button>
          );

          return (
            <div key={item.id}>
              {itemContent}
              {!collapsed && item.children && active && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => {
                    const childActive = child.id === activeId;
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => { onNavigate(child.id); }}
                        disabled={child.disabled}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-button px-3 py-1.5 text-sm font-medium transition-smooth",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          childActive
                            ? "bg-primary/10 text-primary"
                            : "text-text-secondary hover:text-text",
                        )}
                      >
                        {child.icon}
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      {collapsible && (
        <div className="border-t border-border p-2">
          <button
            type="button"
            onClick={() => { onCollapse?.(!collapsed); }}
            className="flex w-full items-center justify-center rounded-button p-2 text-text-muted transition-smooth hover:bg-surface-tertiary hover:text-text"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className={cn("transition-transform", collapsed && "rotate-180")}
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
      {footer && (
        <div className={cn("border-t border-border p-4", collapsed && "px-2")}>
          {footer}
        </div>
      )}
    </aside>
  );
}
