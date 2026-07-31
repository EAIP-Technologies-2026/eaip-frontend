"use client";

import { useState, useCallback } from "react";

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm?: () => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
  });

  const confirm = useCallback(
    (options: Omit<ConfirmState, "open" | "onConfirm">): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          open: true,
          ...options,
          onConfirm: () => {
            setState((prev) => ({ ...prev, open: false }));
            resolve(true);
          },
        });
      });
    },
    [],
  );

  const cancel = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    confirm,
    cancel,
    state,
  };
}
