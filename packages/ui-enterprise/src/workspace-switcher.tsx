"use client";

import { useState, useEffect } from "react";
import { useOnClickOutside } from "@eaip/hooks";
import { EnterpriseIcon } from "./icon";
import { useReducedMotion, durationTokens, easingTokens } from "@eaip/motion";
import type { Workspace } from "./types";

export interface WorkspaceSwitcherProps {
  /** Workspaces list */
  workspaces?: Workspace[];
  /** Currently active workspace */
  activeWorkspace?: Workspace;
  /** Callback fired when a workspace is selected */
  onWorkspaceChange?: (workspace: Workspace) => void;
  /** Additional CSS class names */
  className?: string;
}

const fallbackWorkspace: Workspace = {
  id: "ws-default",
  name: "Default Workspace",
  slug: "default",
};

const defaultWorkspaces: Workspace[] = [fallbackWorkspace];

export function WorkspaceSwitcher({
  workspaces = defaultWorkspaces,
  activeWorkspace,
  onWorkspaceChange,
  className = "",
}: WorkspaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useOnClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

  const current: Workspace = activeWorkspace ?? workspaces[0] ?? fallbackWorkspace;

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const dropdownStyle = prefersReducedMotion
    ? { transitionDuration: "0.01ms" }
    : {
        transitionProperty: "opacity, transform",
        transitionDuration: durationTokens.fast,
        transitionTimingFunction: easingTokens.snappy,
      };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (!open) {
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const currentIdx = workspaces.findIndex((w) => w.id === current.id);
            const nextIdx = (currentIdx + 1) % Math.max(1, workspaces.length);
            const selected = workspaces[nextIdx];
            if (selected && onWorkspaceChange) {
              onWorkspaceChange(selected);
            }
          }
        }}
        aria-label={`Select workspace. Current: ${current.name}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="rounded-button border-border bg-surface hover:bg-surface-tertiary focus:ring-primary flex items-center gap-2 border px-3 py-1.5 text-xs font-medium transition-colors focus:ring-2 focus:outline-none md:text-sm"
      >
        <span className="text-text max-w-[120px] truncate md:max-w-[160px]">{current.name}</span>
        <EnterpriseIcon
          name="chevronDown"
          size={14}
          className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label="Workspaces"
          tabIndex={-1}
          style={dropdownStyle}
          className="rounded-card border-border bg-surface shadow-elevated absolute left-0 z-50 mt-2 w-56 border p-1 focus:outline-none"
        >
          {workspaces.map((workspace) => {
            const isSelected = current.id === workspace.id;

            return (
              <li
                key={workspace.id}
                role="option"
                tabIndex={0}
                aria-selected={isSelected}
                onClick={() => {
                  if (onWorkspaceChange) onWorkspaceChange(workspace);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    if (onWorkspaceChange) onWorkspaceChange(workspace);
                    setOpen(false);
                  }
                }}
                className={`rounded-button text-text-secondary hover:bg-surface-tertiary hover:text-text flex cursor-pointer items-center justify-between px-3 py-2 text-xs transition-colors md:text-sm ${
                  isSelected ? "text-primary font-semibold" : ""
                }`}
              >
                <span className="truncate">{workspace.name}</span>
                {isSelected ? (
                  <EnterpriseIcon name="check" size={14} className="text-primary shrink-0" />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
