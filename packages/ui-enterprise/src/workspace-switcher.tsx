"use client";

import { usePlatformStore } from "@eaip/state";
import { useState } from "react";
import { useOnClickOutside } from "@eaip/hooks";
import { EnterpriseIcon } from "@eaip/icons";

export function WorkspaceSwitcher() {
  const { activeWorkspace, workspaces, setActiveWorkspace } = usePlatformStore();
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

  const current = activeWorkspace ?? workspaces[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 rounded-button border border-border bg-surface px-3 py-2 text-sm transition-smooth hover:bg-surface-tertiary"
      >
        <span className="font-medium text-text">{current?.name}</span>
        <span className="text-xs text-text-muted">Workspace</span>
        <EnterpriseIcon
          name="chevronDown"
          size={14}
          className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-56 rounded-card border border-border bg-surface p-1 shadow-elevated">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              onClick={() => {
                setActiveWorkspace(workspace);
                setOpen(false);
              }}
              className={[
                "w-full rounded-button px-3 py-2 text-left text-sm transition-smooth",
                current?.id === workspace.id
                  ? "bg-primary-subtle text-primary"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text",
              ].join(" ")}
            >
              {workspace.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
