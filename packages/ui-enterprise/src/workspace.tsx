import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";
import { Button } from "@eaip/ui-primitives";

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  activeId: string;
  children: ReactNode;
}

export function TabPanel({ id, activeId, children, className, ...props }: TabPanelProps) {
  if (id !== activeId) return null;
  return (
    <div className={cn("", className)} role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} {...props}>
      {children}
    </div>
  );
}

export interface SplitPaneProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
  defaultSize?: number;
  minSize?: number;
  maxSize?: number;
  direction?: "horizontal" | "vertical";
  primary?: "first" | "second";
  children: [ReactNode, ReactNode];
}

export function SplitPane({
  id: _id,
  defaultSize = 50,
  minSize: _minSize = 20,
  maxSize: _maxSize = 80,
  direction = "horizontal",
  primary = "first",
  children,
  className,
  ...props
}: SplitPaneProps) {
  return (
    <div
      className={cn(
        "flex overflow-hidden rounded-card border border-border bg-surface",
        direction === "horizontal" ? "flex-row" : "flex-col",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          direction === "horizontal" ? "overflow-auto" : "overflow-auto",
          primary === "first" ? `flex-[${String(defaultSize)}_1_0]` : "flex-1",
        )}
      >
        {children[0]}
      </div>
      <div
        className={cn(
          "shrink-0",
          direction === "horizontal" ? "w-1 cursor-col-resize bg-border hover:bg-primary" : "h-1 cursor-row-resize bg-border hover:bg-primary",
        )}
      />
      <div
        className={cn(
          direction === "horizontal" ? "overflow-auto" : "overflow-auto",
          primary === "second" ? `flex-[${String(defaultSize)}_1_0]` : "flex-1",
        )}
      >
        {children[1]}
      </div>
    </div>
  );
}

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Toolbar({ children, className, ...props }: ToolbarProps) {
  return (
    <div className={cn("flex items-center gap-2 rounded-button border border-border bg-surface-secondary px-2 py-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export interface ToolbarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ToolbarGroup({ children, className, ...props }: ToolbarGroupProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  );
}

export interface WorkspaceLayoutProps extends HTMLAttributes<HTMLDivElement> {
  toolbar?: ReactNode;
  tabs?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  sidebarWidth?: string;
}

export function WorkspaceLayout({ toolbar, tabs, sidebar, children, sidebarWidth = "w-64", className, ...props }: WorkspaceLayoutProps) {
  return (
    <div className={cn("flex flex-col h-full", className)} {...props}>
      {toolbar && <div className="shrink-0 border-b border-border bg-surface px-4 py-2">{toolbar}</div>}
      {tabs && <div className="shrink-0 border-b border-border bg-surface px-4">{tabs}</div>}
      <div className="flex flex-1 min-h-0">
        {sidebar && (
          <aside className={cn("shrink-0 border-r border-border bg-surface overflow-y-auto", sidebarWidth)}>
            {sidebar}
          </aside>
        )}
        <main className="flex-1 overflow-y-auto bg-surface-secondary p-4">
          {children}
        </main>
      </div>
    </div>
  );
}

export interface QuickActionProps extends HTMLAttributes<HTMLDivElement> {
  actions: { id: string; label: string; icon?: ReactNode; shortcut?: string; onClick: () => void }[];
}

export function QuickActions({ actions, className, ...props }: QuickActionProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      {actions.map((action) => (
        <Button
          key={action.id}
          type="button"
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          iconLeft={action.icon}
        >
          {action.label}
          {action.shortcut && (
            <kbd className="ml-1.5 rounded border border-border bg-surface-tertiary px-1 py-0.5 text-[10px] font-medium text-text-muted">{action.shortcut}</kbd>
          )}
        </Button>
      ))}
    </div>
  );
}