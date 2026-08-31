/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions, @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-condition, jsx-a11y/no-redundant-roles, jsx-a11y/no-noninteractive-tabindex */
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { cn } from "@eaip/core";
import { Button, Badge, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationSeverity = "info" | "success" | "warning" | "error" | "critical";

export type NotificationCategory =
  | "system"
  | "security"
  | "operations"
  | "approvals"
  | "automation"
  | "workflow"
  | "deployment"
  | "knowledge"
  | "conductor";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  summary: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  acknowledged: boolean;
  dismissed: boolean;
  source: string;
  deepLink: string | null;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  groupKey: string | null;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  acknowledged: number;
  dismissed: number;
}

export type NotificationFilter = "all" | "unread" | "acknowledged";

// ---------------------------------------------------------------------------
// Severity & Category helpers
// ---------------------------------------------------------------------------

const severityColors: Record<NotificationSeverity, string> = {
  info: "text-primary",
  success: "text-success",
  warning: "text-warning",
  error: "text-danger",
  critical: "text-danger",
};

const severityIcons: Record<NotificationSeverity, string> = {
  info: "alert",
  success: "checkCircle",
  warning: "alert",
  error: "x",
  critical: "alert",
};

const categoryLabels: Record<NotificationCategory, string> = {
  system: "System",
  security: "Security",
  operations: "Operations",
  approvals: "Approvals",
  automation: "Automation",
  workflow: "Workflow",
  deployment: "Deployment",
  knowledge: "Knowledge",
  conductor: "Conductor",
};

const categoryIcons: Record<NotificationCategory, string> = {
  system: "settings",
  security: "shield",
  operations: "activity",
  approvals: "checkSquare",
  automation: "zap",
  workflow: "workflow",
  deployment: "rocket",
  knowledge: "book",
  conductor: "robot",
};

// ---------------------------------------------------------------------------
// SeverityIndicator
// ---------------------------------------------------------------------------

function SeverityIndicator({ severity }: { severity: NotificationSeverity }) {
  const icon = severityIcons[severity];
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        severityColors[severity],
      )}
      aria-label={`Severity: ${severity}`}
    >
      <EnterpriseIcon name={icon as never} size={16} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategoryBadge
// ---------------------------------------------------------------------------

function CategoryBadge({ category }: { category: NotificationCategory }) {
  return (
    <Badge variant="glass" className="text-[10px]">
      <EnterpriseIcon name={categoryIcons[category] as never} size={10} />
      {categoryLabels[category]}
    </Badge>
  );
}

// ---------------------------------------------------------------------------
// NotificationDetail
// ---------------------------------------------------------------------------

export interface NotificationDetailProps {
  notification: NotificationItem;
  onMarkRead?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onNavigate?: (deepLink: string) => void;
  onClose?: () => void;
}

export function NotificationDetail({
  notification,
  onMarkRead,
  onAcknowledge,
  onDismiss,
  onNavigate,
  onClose,
}: NotificationDetailProps) {
  const n = notification;
  const timeAgo = getTimeAgo(n.timestamp);

  return (
    <div className="flex h-full flex-col" role="dialog" aria-label={`Notification: ${n.title}`}>
      <div className="border-border flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <SeverityIndicator severity={n.severity} />
          <div>
            <h3 className="text-text text-sm font-semibold">{n.title}</h3>
            <div className="mt-0.5 flex items-center gap-2">
              <CategoryBadge category={n.category} />
              <span className="text-text-muted text-xs">{timeAgo}</span>
            </div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:bg-surface-tertiary rounded p-1"
            aria-label="Close detail"
          >
            <EnterpriseIcon name="x" size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {n.source && (
          <div className="text-text-muted flex items-center gap-2 text-xs">
            <EnterpriseIcon name="circle" size={12} />
            <span>Source: {n.source}</span>
          </div>
        )}

        <div className="text-text text-sm leading-relaxed">{n.message || n.summary}</div>

        {n.relatedEntityId && (
          <div className="text-text-muted flex items-center gap-2 text-xs">
            <EnterpriseIcon name="workflow" size={12} />
            <span>
              Related: {n.relatedEntityType ?? "entity"} ({n.relatedEntityId})
            </span>
          </div>
        )}

        <div className="text-text-muted text-xs">{new Date(n.timestamp).toLocaleString()}</div>
      </div>

      <div className="border-border flex items-center gap-2 border-t px-4 py-3">
        {n.deepLink && onNavigate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onNavigate(n.deepLink!);
            }}
          >
            <EnterpriseIcon name="arrowRight" size={14} />
            View
          </Button>
        )}
        {!n.read && onMarkRead && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onMarkRead(n.id);
            }}
          >
            <EnterpriseIcon name="check" size={14} />
            Mark Read
          </Button>
        )}
        {!n.acknowledged && onAcknowledge && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onAcknowledge(n.id);
            }}
          >
            <EnterpriseIcon name="checkCircle" size={14} />
            Acknowledge
          </Button>
        )}
        {!n.dismissed && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onDismiss(n.id);
            }}
          >
            <EnterpriseIcon name="x" size={14} />
            Dismiss
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NotificationCenter
// ---------------------------------------------------------------------------

export interface NotificationCenterProps {
  items: NotificationItem[];
  counts?: NotificationCounts;
  categoryCounts?: Record<string, number>;
  severityCounts?: Record<string, number>;
  loading?: boolean;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onRemove?: (id: string) => void;
  onNavigate?: (deepLink: string) => void;
  onFilterChange?: (filter: NotificationFilter) => void;
  onCategoryChange?: (category: NotificationCategory | null) => void;
  onSeverityChange?: (severity: NotificationSeverity | null) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
}

export function NotificationCenter({
  items,
  counts,
  categoryCounts,
  severityCounts,
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onAcknowledge,
  onDismiss,
  onRemove: _onRemove,
  onNavigate,
  onFilterChange,
  onCategoryChange,
  onSeverityChange,
  onSearchChange,
  className,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<NotificationSeverity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFilterChange = useCallback(
    (newFilter: NotificationFilter) => {
      setFilter(newFilter);
      onFilterChange?.(newFilter);
    },
    [onFilterChange],
  );

  const handleCategoryChange = useCallback(
    (category: NotificationCategory | null) => {
      setSelectedCategory(category);
      onCategoryChange?.(category);
    },
    [onCategoryChange],
  );

  const handleSeverityChange = useCallback(
    (severity: NotificationSeverity | null) => {
      setSelectedSeverity(severity);
      onSeverityChange?.(severity);
    },
    [onSeverityChange],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        onSearchChange?.(value);
      }, 300);
    },
    [onSearchChange],
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (filter === "unread") {
      result = result.filter((n) => !n.read && !n.dismissed);
    } else if (filter === "acknowledged") {
      result = result.filter((n) => n.acknowledged);
    }
    if (selectedCategory) {
      result = result.filter((n) => n.category === selectedCategory);
    }
    if (selectedSeverity) {
      result = result.filter((n) => n.severity === selectedSeverity);
    }
    return result.filter((n) => !n.dismissed);
  }, [items, filter, selectedCategory, selectedSeverity]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);

    for (const n of filteredItems) {
      const date = new Date(n.timestamp);
      let key = "Earlier";
      if (date.toDateString() === today.toDateString()) key = "Today";
      else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";
      else if (date >= thisWeek) key = "This Week";
      else if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear())
        key = "This Month";
      groups[key] ??= [];
      groups[key]!.push(n);
    }
    return groups;
  }, [filteredItems]);

  const selectedNotification = selectedId ? items.find((n) => n.id === selectedId) : null;
  const unreadCount = counts?.unread ?? items.filter((n) => !n.read && !n.dismissed).length;

  const categoryEntries = useMemo(() => {
    if (!categoryCounts) return [];
    return Object.entries(categoryCounts).filter(([, count]) => count > 0);
  }, [categoryCounts]);

  const severityEntries = useMemo(() => {
    if (!severityCounts) return [];
    return Object.entries(severityCounts).filter(([, count]) => count > 0);
  }, [severityCounts]);

  return (
    <div className={cn("flex h-full", className)}>
      {/* Main panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="border-border border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-text text-base font-semibold">Notifications</h2>
              {unreadCount > 0 && <Badge variant="danger">{String(unreadCount)}</Badge>}
            </div>
            <div className="flex items-center gap-2">
              {onMarkAllRead && unreadCount > 0 && (
                <Button type="button" variant="ghost" size="xs" onClick={onMarkAllRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <div className="mt-2 flex items-center gap-1">
            {(["all", "unread", "acknowledged"] as NotificationFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  handleFilterChange(f);
                }}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  filter === f
                    ? "bg-primary text-text-inverse"
                    : "text-text-secondary hover:bg-surface-tertiary",
                )}
              >
                {f === "all"
                  ? `All (${String(counts?.total ?? items.length)})`
                  : f === "unread"
                    ? `Unread (${String(unreadCount)})`
                    : `Acknowledged (${String(counts?.acknowledged ?? 0)})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mt-2">
            <label htmlFor="notification-search-input" className="sr-only">
              Search notifications
            </label>
            <Input
              id="notification-search-input"
              aria-label="Search notifications"
              type="search"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => {
                handleSearchChange(e.target.value);
              }}
              onClear={() => {
                handleSearchChange("");
              }}
              iconLeft="search"
              className="text-sm"
            />
          </div>

          {/* Category & Severity filters */}
          {(categoryEntries.length > 0 || severityEntries.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {categoryEntries.map(([cat, count]) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    handleCategoryChange(
                      selectedCategory === cat ? null : (cat as NotificationCategory),
                    );
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                    selectedCategory === cat
                      ? "bg-primary text-text-inverse"
                      : "bg-surface-tertiary text-text-secondary hover:bg-surface-secondary",
                  )}
                >
                  <EnterpriseIcon
                    name={categoryIcons[cat as NotificationCategory] as never}
                    size={10}
                  />
                  {categoryLabels[cat as NotificationCategory] ?? cat}
                  <span className="opacity-60">{String(count)}</span>
                </button>
              ))}
              {severityEntries.map(([sev, count]) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => {
                    handleSeverityChange(
                      selectedSeverity === sev ? null : (sev as NotificationSeverity),
                    );
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors",
                    selectedSeverity === sev
                      ? "bg-primary text-text-inverse"
                      : "bg-surface-tertiary text-text-secondary hover:bg-surface-secondary",
                  )}
                >
                  {sev}
                  <span className="opacity-60">{String(count)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto" role="list" aria-label="Notifications">
          {loading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse gap-3">
                  <div className="bg-surface-tertiary h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="bg-surface-tertiary h-3 w-3/4 rounded" />
                    <div className="bg-surface-tertiary h-2 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(groupedItems).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-surface-tertiary text-text-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                <EnterpriseIcon name="bell" size={24} />
              </div>
              <p className="text-text text-sm font-medium">All caught up!</p>
              <p className="text-text-secondary mt-1 text-xs">
                {filter === "unread" ? "No unread notifications." : "No notifications yet."}
              </p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([groupLabel, groupItems]) => (
              <div key={groupLabel} role="group" aria-label={groupLabel}>
                <div className="bg-surface-secondary/80 sticky top-0 z-10 px-4 py-1.5 backdrop-blur-sm">
                  <span className="text-text-muted text-[10px] font-semibold tracking-wider uppercase">
                    {groupLabel}
                  </span>
                </div>
                <ul className="divide-border divide-y">
                  {groupItems.map((item) => (
                    <li
                      key={item.id}
                      role="listitem"
                      className={cn(
                        "transition-smooth hover:bg-surface-secondary flex cursor-pointer items-start gap-3 px-4 py-3",
                        !item.read && "bg-primary-subtle/20",
                        selectedId === item.id && "bg-primary-subtle/40 ring-primary/20 ring-1",
                      )}
                      onClick={() => {
                        setSelectedId(item.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedId(item.id);
                        }
                      }}
                      tabIndex={0}
                      aria-current={selectedId === item.id ? "true" : undefined}
                    >
                      <SeverityIndicator severity={item.severity} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm",
                              item.read ? "text-text-secondary" : "text-text font-medium",
                            )}
                          >
                            {item.title}
                          </p>
                          {!item.read && (
                            <span
                              className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full"
                              aria-label="Unread"
                            />
                          )}
                        </div>
                        {(item.summary || item.message) && (
                          <p className="text-text-muted mt-0.5 line-clamp-2 text-xs">
                            {item.summary || item.message}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-2">
                          <CategoryBadge category={item.category} />
                          <span className="text-text-muted text-[10px]">
                            {getTimeAgo(item.timestamp)}
                          </span>
                          {item.acknowledged && (
                            <Badge variant="success" className="text-[10px]">
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex shrink-0 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {!item.read && onMarkRead && (
                          <button
                            type="button"
                            onClick={() => {
                              onMarkRead(item.id);
                            }}
                            className="text-text-secondary hover:bg-surface-tertiary rounded p-1"
                            title="Mark as read"
                            aria-label="Mark as read"
                          >
                            <EnterpriseIcon name="check" size={14} />
                          </button>
                        )}
                        {!item.acknowledged && onAcknowledge && (
                          <button
                            type="button"
                            onClick={() => {
                              onAcknowledge(item.id);
                            }}
                            className="text-text-secondary hover:bg-surface-tertiary rounded p-1"
                            title="Acknowledge"
                            aria-label="Acknowledge"
                          >
                            <EnterpriseIcon name="checkCircle" size={14} />
                          </button>
                        )}
                        {onDismiss && (
                          <button
                            type="button"
                            onClick={() => {
                              onDismiss(item.id);
                            }}
                            className="text-text-secondary hover:bg-surface-tertiary hover:text-danger rounded p-1"
                            title="Dismiss"
                            aria-label="Dismiss"
                          >
                            <EnterpriseIcon name="x" size={14} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedNotification && (
        <div className="border-border bg-surface flex w-96 flex-col border-l">
          <NotificationDetail
            notification={selectedNotification}
            onMarkRead={onMarkRead}
            onAcknowledge={onAcknowledge}
            onDismiss={onDismiss}
            onNavigate={onNavigate}
            onClose={() => {
              setSelectedId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NotificationBell (enhanced)
// ---------------------------------------------------------------------------

export interface NotificationBellProps {
  unreadCount: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ unreadCount, onClick, className }: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-button text-text-secondary transition-smooth hover:bg-surface-tertiary hover:text-text relative p-2",
        className,
      )}
      aria-label={`Notifications${unreadCount > 0 ? `, ${String(unreadCount)} unread` : ""}`}
      aria-haspopup="true"
    >
      <EnterpriseIcon name="bell" size={20} />
      {unreadCount > 0 ? (
        <span
          className="bg-danger text-text-inverse absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium"
          aria-hidden="true"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${String(diffMins)}m ago`;
  if (diffHours < 24) return `${String(diffHours)}h ago`;
  if (diffDays < 7) return `${String(diffDays)}d ago`;
  return date.toLocaleDateString();
}
