"use client";

import { usePlatformStore } from "@eaip/state";
import { useState } from "react";
import { useOnClickOutside } from "@eaip/hooks";

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
        className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
      >
        <span className="font-medium text-gray-900">{current?.name}</span>
        <span className="text-xs text-gray-500">Workspace</span>
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-56 rounded-lg border bg-white p-1 shadow-lg">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              onClick={() => {
                setActiveWorkspace(workspace);
                setOpen(false);
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                current?.id === workspace.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
              }`}
            >
              {workspace.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
