"use client";

import type { ReactNode } from "react";
import { Button } from "@eaip/ui-primitives";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <button
        type="button"
        className="bg-scrim/60 motion-safe:animate-in motion-safe:fade-in-0 fixed inset-0 backdrop-blur-sm duration-300"
        onClick={onCancel}
        aria-label="Cancel"
      />
      <div className="bg-surface-glass border-border/80 motion-safe:animate-in motion-safe:zoom-in-[0.97] motion-safe:fade-in-0 relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(56,189,248,0.15)] saturate-150 backdrop-blur-2xl duration-300 ease-out dark:border-white/10">
        <h2 id="confirm-title" className="text-text text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <div className="text-text-secondary mt-2 text-sm">{message}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
