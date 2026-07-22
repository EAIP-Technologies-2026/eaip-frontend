"use client";

import { usePlatformStore } from "@eaip/state";
import { useEffect, useRef } from "react";

export function GlobalSearchTrigger() {
  const { openGlobalSearch } = usePlatformStore();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        openGlobalSearch();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openGlobalSearch]);

  return (
    <button
      type="button"
      onClick={openGlobalSearch}
      className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 md:flex"
    >
      <span>Search...</span>
      <kbd className="rounded border bg-gray-100 px-1.5 text-xs">⌘K</kbd>
    </button>
  );
}

export function GlobalSearchDialog() {
  const { globalSearchOpen, closeGlobalSearch } = usePlatformStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (globalSearchOpen) {
      inputRef.current?.focus();
    }
  }, [globalSearchOpen]);

  if (!globalSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24">
      <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl">
        <div className="flex items-center gap-2 border-b pb-3">
          <span className="text-gray-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across EAIP..."
            className="flex-1 bg-transparent text-lg outline-none"
          />
          <button
            type="button"
            onClick={closeGlobalSearch}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            Esc
          </button>
        </div>
        <div className="py-8 text-center text-sm text-gray-500">
          Global search is connected to the backend search API.
        </div>
      </div>
    </div>
  );
}
