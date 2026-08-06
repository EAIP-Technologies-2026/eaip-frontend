"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { EnterpriseIcon } from "@eaip/icons";

export type NotificationType = "toast" | "banner" | "inline" | "system";
export type NotificationVariant = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  variant?: NotificationVariant;
  title: string;
  description?: ReactNode;
  durationMs?: number;
  onDismiss?: (id: string) => void;
}

export interface NotificationEngineProps {
  notifications: NotificationItem[];
  onDismiss?: (id: string) => void;
  className?: string;
}

const variantStyles: Record<
  NotificationVariant,
  { bg: string; border: string; text: string; icon: string }
> = {
  info: { bg: "bg-surface", border: "border-primary/30", text: "text-primary", icon: "info" },
  success: {
    bg: "bg-surface",
    border: "border-success/30",
    text: "text-success",
    icon: "checkCircle",
  },
  warning: {
    bg: "bg-surface",
    border: "border-warning/30",
    text: "text-warning",
    icon: "alertTriangle",
  },
  error: { bg: "bg-surface", border: "border-danger/30", text: "text-danger", icon: "alertCircle" },
};

export function NotificationRenderer({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss?: (id: string) => void;
}) {
  const variant = item.variant ?? "info";
  const styles = variantStyles[variant];

  useEffect(() => {
    if (item.durationMs && item.durationMs > 0) {
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss(item.id);
        if (item.onDismiss) item.onDismiss(item.id);
      }, item.durationMs);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [item, onDismiss]);

  if (item.type === "banner") {
    return (
      <div
        data-slot="notification-banner"
        data-variant={variant}
        className={`w-full border-b ${styles.border} ${styles.bg} px-4 py-3 shadow-sm`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <EnterpriseIcon name={styles.icon as never} size={18} className={styles.text} />
            <span className="text-text font-semibold">{item.title}</span>
            {item.description ? (
              <span className="text-text-secondary">— {item.description}</span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              if (onDismiss) onDismiss(item.id);
              if (item.onDismiss) item.onDismiss(item.id);
            }}
            className="text-text-muted hover:text-text rounded p-1 focus:outline-none"
            aria-label="Dismiss banner"
          >
            <EnterpriseIcon name="x" size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (item.type === "inline") {
    return (
      <div
        data-slot="notification-inline"
        data-variant={variant}
        className={`rounded-card flex items-start gap-3 border ${styles.border} ${styles.bg} p-4 shadow-sm`}
      >
        <EnterpriseIcon
          name={styles.icon as never}
          size={20}
          className={`${styles.text} mt-0.5 shrink-0`}
        />
        <div className="flex-1">
          <h4 className="text-text text-sm font-semibold">{item.title}</h4>
          {item.description ? (
            <div className="text-text-secondary mt-1 text-xs">{item.description}</div>
          ) : null}
        </div>
      </div>
    );
  }

  // Toast / System default
  return (
    <div
      data-slot="notification-toast"
      data-variant={variant}
      className={`rounded-card flex items-start gap-3 border ${styles.border} ${styles.bg} shadow-elevated w-80 max-w-sm p-4`}
    >
      <EnterpriseIcon
        name={styles.icon as never}
        size={20}
        className={`${styles.text} mt-0.5 shrink-0`}
      />
      <div className="min-w-0 flex-1">
        <h4 className="text-text truncate text-sm font-semibold">{item.title}</h4>
        {item.description ? (
          <p className="text-text-secondary mt-1 text-xs">{item.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => {
          if (onDismiss) onDismiss(item.id);
          if (item.onDismiss) item.onDismiss(item.id);
        }}
        className="text-text-muted hover:text-text shrink-0 rounded p-1 focus:outline-none"
        aria-label="Dismiss notification"
      >
        <EnterpriseIcon name="x" size={14} />
      </button>
    </div>
  );
}

export function NotificationEngine({
  notifications,
  onDismiss,
  className = "",
}: NotificationEngineProps) {
  const toasts = notifications.filter((n) => n.type === "toast" || n.type === "system");
  const banners = notifications.filter((n) => n.type === "banner");
  const inlines = notifications.filter((n) => n.type === "inline");

  return (
    <div className={className} data-slot="notification-engine">
      {/* Top Banner Region */}
      {banners.length > 0 ? (
        <div className="fixed top-0 right-0 left-0 z-50 space-y-1">
          {banners.map((b) => (
            <NotificationRenderer key={b.id} item={b} onDismiss={onDismiss} />
          ))}
        </div>
      ) : null}

      {/* Inline Notifications Region */}
      {inlines.length > 0 ? (
        <div className="my-2 space-y-2">
          {inlines.map((i) => (
            <NotificationRenderer key={i.id} item={i} onDismiss={onDismiss} />
          ))}
        </div>
      ) : null}

      {/* Floating Toast Container */}
      {toasts.length > 0 ? (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <NotificationRenderer key={t.id} item={t} onDismiss={onDismiss} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
