"use client";

import { usePlatformStore } from "@eaip/state";
import { useEffect, useRef } from "react";

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
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [commandPaletteOpen, closeCommandPalette]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24">
      <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-xl">
        <div className="flex items-center gap-2 border-b pb-3">
          <span className="text-gray-400">⌘</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-lg outline-none"
          />
          <button
            type="button"
            onClick={closeCommandPalette}
            className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            Esc
          </button>
        </div>
        <div className="py-8 text-center text-sm text-gray-500">
          Command palette is ready for command registration.
        </div>
      </div>
    </div>
  );
}
