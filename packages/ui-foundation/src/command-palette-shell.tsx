"use client";

import type { HTMLAttributes } from "react";
import { useState, useEffect } from "react";
import { Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

export interface CommandPaletteItem {
  id: string;
  label: string;
  category?: string;
  icon?: string;
  shortcut?: string;
}

export interface CommandPaletteShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  open: boolean;
  onClose: () => void;
  items: CommandPaletteItem[];
  onSelect?: (item: CommandPaletteItem) => void;
  placeholder?: string;
}

export function CommandPaletteShell({
  open,
  onClose,
  items,
  onSelect,
  placeholder = "Type a command or search...",
  className = "",
  ...props
}: CommandPaletteShellProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category?.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + Math.max(1, filteredItems.length)) % Math.max(1, filteredItems.length),
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected && onSelect) {
          onSelect(selected);
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, filteredItems, selectedIndex, onSelect, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      data-slot="command-palette-shell"
      data-state="open"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20"
    >
      <button
        type="button"
        aria-label="Close command palette"
        className="fixed inset-0 cursor-default border-0 bg-scrim backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`rounded-card border-border bg-surface shadow-elevated relative z-10 w-full max-w-xl overflow-hidden border ${className}`}
        {...props}
      >
        <div className="border-border border-b p-3">
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={placeholder}
            className="border-none shadow-none focus:ring-0"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="text-text-muted p-4 text-center text-xs">No commands found</div>
          ) : (
            <ul role="listbox" aria-label="Command suggestions" className="space-y-1">
              {filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <li
                    key={item.id}
                    role="option"
                    tabIndex={0}
                    aria-selected={isSelected}
                    onClick={() => {
                      if (onSelect) onSelect(item);
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        if (onSelect) onSelect(item);
                        onClose();
                      }
                    }}
                    className={`rounded-button flex cursor-pointer items-center justify-between px-3 py-2 text-xs md:text-sm ${
                      isSelected
                        ? "bg-primary-subtle text-primary font-semibold"
                        : "text-text-secondary hover:bg-surface-tertiary"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon ? <EnterpriseIcon name={item.icon as never} size={16} /> : null}
                      <span>{item.label}</span>
                      {item.category ? (
                        <span className="text-text-muted text-[10px]">in {item.category}</span>
                      ) : null}
                    </div>
                    {item.shortcut ? (
                      <kbd className="border-border bg-surface-tertiary text-text-muted rounded border px-1.5 py-0.5 text-[10px]">
                        {item.shortcut}
                      </kbd>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
