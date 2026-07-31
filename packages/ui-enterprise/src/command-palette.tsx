"use client";

import { usePlatformStore } from "@eaip/state";
import { useEffect, useRef } from "react";
import { EnterpriseIcon } from "@eaip/icons";

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = usePlatformStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      inputRef.current?.focus();
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCommandPalette();
      }
    }
    if (commandPaletteOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [commandPaletteOpen, closeCommandPalette]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="w-full max-w-2xl rounded-card border border-border bg-surface p-4 shadow-elevated">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <EnterpriseIcon name="search" size={18} className="text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search agents, pages, and commands..."
            className="flex-1 bg-transparent text-lg text-text outline-none placeholder:text-text-muted focus-visible:ring-0"
            aria-label="Command palette search"
          />
          <button
            type="button"
            onClick={closeCommandPalette}
            className="rounded-button px-2 py-1 text-sm text-text-muted transition-smooth hover:bg-surface-tertiary hover:text-text"
            aria-label="Close command palette"
          >
            Esc
          </button>
        </div>
        <div className="py-6 text-center text-sm text-text-secondary">
          <p className="text-text-muted">Type to search across the platform</p>
          <div className="mt-3 flex justify-center gap-2">
            <span className="rounded bg-surface-tertiary px-2 py-1 text-xs text-text-muted">⌘K Search</span>
            <span className="rounded bg-surface-tertiary px-2 py-1 text-xs text-text-muted">↑↓ Navigate</span>
            <span className="rounded bg-surface-tertiary px-2 py-1 text-xs text-text-muted">↵ Select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
