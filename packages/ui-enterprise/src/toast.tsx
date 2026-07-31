"use client";

import { useEffect } from "react";
import { usePlatformStore, type PlatformToast } from "@eaip/state";
import { EnterpriseIcon } from "./icon";

const typeStyles: Record<PlatformToast["type"], { wrapper: string; icon: string }> = {
  info: { wrapper: "border-l-3 border-l-primary border-y border-r border-border bg-surface text-text shadow-depth", icon: "alert" },
  success: { wrapper: "border-l-3 border-l-success border-y border-r border-border bg-surface text-text shadow-depth", icon: "checkCircle" },
  warning: { wrapper: "border-l-3 border-l-warning border-y border-r border-border bg-surface text-text shadow-depth", icon: "alert" },
  error: { wrapper: "border-l-3 border-l-danger border-y border-r border-border bg-surface text-text shadow-depth", icon: "alert" },
};

function ToastItem({ toast }: { toast: PlatformToast }) {
  const removeToast = usePlatformStore((state) => state.removeToast);

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    if (duration <= 0) return;
    const timer = window.setTimeout(() => {
      removeToast(toast.id);
    }, duration);
    return () => {
      window.clearTimeout(timer);
    };
  }, [toast.id, toast.duration, removeToast]);

  const styles = typeStyles[toast.type];

  return (
    <div
      className={[
        "toast-enter pointer-events-auto flex w-80 items-start gap-3 rounded-card p-4 transition-all",
        styles.wrapper,
      ].join(" ")}
      role="alert"
    >
      <EnterpriseIcon name={styles.icon} size={20} />
      <div className="flex-1">
        <p className="font-medium">{toast.title}</p>
        {toast.message ? <p className="text-sm opacity-90">{toast.message}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => {
          removeToast(toast.id);
        }}
        className="rounded-button p-1 text-sm opacity-70 transition-smooth hover:bg-black/5 hover:opacity-100"
        aria-label="Dismiss toast"
      >
        <EnterpriseIcon name="x" size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = usePlatformStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
