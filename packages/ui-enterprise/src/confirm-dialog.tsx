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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <button
        type="button"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Cancel"
      />
      <div className="relative z-10 w-full max-w-md rounded-card bg-surface p-6 shadow-elevated">
        <h2 id="confirm-title" className="text-lg font-semibold text-text">
          {title}
        </h2>
        <div className="mt-2 text-sm text-text-secondary">{message}</div>
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
