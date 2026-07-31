"use client";

import { useEffect, useCallback } from "react";

export function useUnsavedChangesGuard(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const confirmNavigation = useCallback((): boolean => {
    if (!isDirty) return true;
    return window.confirm("You have unsaved changes. Are you sure you want to leave?");
  }, [isDirty]);

  return { confirmNavigation };
}
