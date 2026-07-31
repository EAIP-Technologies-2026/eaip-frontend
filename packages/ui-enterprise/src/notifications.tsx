import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";
import { Button, Badge, Avatar } from "@eaip/ui-primitives";

export interface NotificationItemData {
  id: string;
  title: string;
  message?: string;
  timestamp: string;
  read: boolean;
  type?: "info" | "success" | "warning" | "error";
  avatar?: string;
  actionable?: boolean;
}

export interface NotificationPanelProps extends HTMLAttributes<HTMLDivElement> {
  items: NotificationItemData[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onRemove?: (id: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const typeIcons: Record<string, ReactNode> = {
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L2 22h20L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10v4M12 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const typeColors: Record<string, string> = {
  info: "text-primary",
  success: "text-success",
  warning: "text-warning",
  error: "text-danger",
};

export function NotificationPanel({ items, onMarkRead, onMarkAllRead, onRemove, loading = false, emptyMessage = "No notifications", className, ...props }: NotificationPanelProps) {
  return (
    <div className={cn("rounded-card border border-border bg-surface shadow-elevated", className)} {...props}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text">Notifications</h3>
        {onMarkAllRead && items.some((n) => !n.read) && (
          <Button type="button" variant="ghost" size="xs" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-surface-tertiary" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-surface-tertiary" />
                  <div className="h-2 w-1/2 rounded bg-surface-tertiary" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-surface-tertiary text-text-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-sm text-text-secondary">{emptyMessage}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 transition-smooth hover:bg-surface-secondary",
                  !item.read && "bg-primary-subtle/30",
                )}
              >
                {item.avatar ? (
                  <Avatar name={item.title} size="sm" />
                ) : (
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", typeColors[item.type ?? "info"])}>
                    {typeIcons[item.type ?? "info"]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm", item.read ? "text-text-secondary" : "font-medium text-text")}>{item.title}</p>
                    {!item.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                  {item.message && <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{item.message}</p>}
                  <p className="text-xs text-text-muted mt-1">{item.timestamp}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!item.read && onMarkRead && (
                    <Button type="button" variant="ghost" size="xs" onClick={() => { onMarkRead(item.id); }}>
                      Read
                    </Button>
                  )}
                  {onRemove && (
                    <Button type="button" variant="ghost" size="xs" onClick={() => { onRemove(item.id); }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export interface ActivityFeedProps {
  className?: string;
  items: { id: string; title: string; description?: string; timestamp: string; type?: "create" | "update" | "delete" | "info"; actor?: string }[];
  loading?: boolean;
}

const activityIcons: Record<string, ReactNode> = {
  create: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  update: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  delete: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

const activityColors: Record<string, string> = {
  create: "text-success",
  update: "text-primary",
  delete: "text-danger",
  info: "text-text-muted",
};

export function ActivityFeed({ items, loading = false, className, ...props }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className={cn("space-y-4", className)} {...props}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-surface-tertiary" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 rounded bg-surface-tertiary" />
              <div className="h-2 w-1/3 rounded bg-surface-tertiary" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)} {...props}>
      {items.map((item, index) => (
        <li key={item.id} className="relative pl-8 pb-4">
          {index < items.length - 1 && (
            <span className="absolute left-[11px] top-6 h-full w-px bg-border" aria-hidden="true" />
          )}
          <div className={cn("absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full", activityColors[item.type ?? "info"])}>
            {activityIcons[item.type ?? "info"]}
          </div>
          <div className="text-sm">
            <span className="font-medium text-text">{item.title}</span>
            {item.description && <span className="text-text-secondary ml-1">{item.description}</span>}
            <div className="flex items-center gap-2 mt-0.5">
              {item.actor && <span className="text-xs font-medium text-text-muted">{item.actor}</span>}
              <span className="text-xs text-text-muted">{item.timestamp}</span>
            </div>
          </div>
        </li>
      ))}
    </div>
  );
}

export interface SystemStatusProps extends HTMLAttributes<HTMLDivElement> {
  services: { id: string; name: string; status: "healthy" | "degraded" | "down"; latency?: string }[];
}

export function SystemStatus({ services, className, ...props }: SystemStatusProps) {
  const statusColors = { healthy: "bg-success", degraded: "bg-warning", down: "bg-danger" };
  const statusLabels = { healthy: "Operational", degraded: "Degraded", down: "Down" };

  return (
    <div className={cn("rounded-card border border-border bg-surface p-4", className)} {...props}>
      <h3 className="text-sm font-semibold text-text mb-3">System Status</h3>
      <ul className="space-y-2">
        {services.map((service) => (
          <li key={service.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", statusColors[service.status])} />
              <span className="text-sm text-text">{service.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {service.latency && <span className="text-xs text-text-muted">{service.latency}</span>}
              <Badge variant={service.status === "healthy" ? "success" : service.status === "degraded" ? "warning" : "danger"}>
                {statusLabels[service.status]}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface AuditLogEntryProps extends HTMLAttributes<HTMLDivElement> {
  entries: { id: string; action: string; detail: string; actor: string; timestamp: string; severity?: "info" | "warning" | "error" }[];
}

export function AuditLogViewer({ entries, className, ...props }: AuditLogEntryProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="overflow-x-auto rounded-card border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-secondary">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Action</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Detail</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Actor</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {entries.map((entry) => (
              <tr key={entry.id} className="transition-smooth hover:bg-surface-secondary">
                <td className="px-4 py-2.5 text-sm text-text whitespace-nowrap">{entry.action}</td>
                <td className="px-4 py-2.5 text-sm text-text-secondary">{entry.detail}</td>
                <td className="px-4 py-2.5 text-sm text-text-secondary whitespace-nowrap">{entry.actor}</td>
                <td className="px-4 py-2.5 text-sm text-text-muted whitespace-nowrap">{entry.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-text-secondary">No audit log entries found.</div>
        )}
      </div>
    </div>
  );
}