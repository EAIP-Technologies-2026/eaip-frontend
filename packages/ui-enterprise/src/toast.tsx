"use client";

import { useEffect } from "react";
import { usePlatformStore, type PlatformToast } from "@eaip/state";
import { cn } from "@eaip/utilities";
import { EnterpriseIcon } from "./icon";

const typeStyles: Record<PlatformToast["type"], { wrapper: string; icon: string; text: string }> = {
  info: {
    wrapper: "border-white/10 dark:border-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.1)]",
    icon: "alert",
    text: "text-text",
  },
  success: {
    wrapper: "border-success/30 shadow-[0_0_16px_rgba(34,197,94,0.15)]",
    icon: "checkCircle",
    text: "text-success",
  },
  warning: {
    wrapper: "border-warning/30 shadow-[0_0_16px_rgba(245,158,11,0.15)]",
    icon: "alert",
    text: "text-warning",
  },
  error: {
    wrapper: "border-danger/30 shadow-[0_0_16px_rgba(239,68,68,0.15)]",
    icon: "alert",
    text: "text-danger",
  },
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
        "toast-enter pointer-events-auto flex w-80 items-start gap-3 rounded-xl p-3.5 transition-all duration-300",
        "bg-surface-glass border text-sm saturate-150 backdrop-blur-2xl",
        styles.wrapper,
      ].join(" ")}
      role="alert"
    >
      <div className={cn("mt-0.5", styles.text)}>
        <EnterpriseIcon name={styles.icon} size={18} />
      </div>
      <div className="flex-1">
        <p className="text-text font-semibold tracking-tight">{toast.title}</p>
        {toast.message ? (
          <p className="text-text-secondary mt-0.5 text-xs leading-relaxed">{toast.message}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => {
          removeToast(toast.id);
        }}
        className="text-text-muted hover:bg-surface-tertiary hover:text-text rounded-full p-1.5 transition-colors"
        aria-label="Dismiss toast"
      >
        <EnterpriseIcon name="x" size={14} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = usePlatformStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-6 bottom-6 z-[999] flex flex-col-reverse items-end gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
