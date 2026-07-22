"use client";

import { useState } from "react";
import { useOnClickOutside } from "@eaip/hooks";
import { cn } from "@eaip/utilities";
import { getAllEnterpriseApps, getEnterpriseApp } from "./navigation";

export interface AppSwitcherProps {
  currentAppId: string;
}

export function AppSwitcher({ currentAppId }: AppSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });
  const current = getEnterpriseApp(currentAppId);
  const apps = getAllEnterpriseApps();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
      >
        <span className={cn("h-3 w-3 rounded-full", current?.color ?? "bg-gray-400")} />
        <span className="hidden text-sm font-medium text-gray-900 md:block">
          {current?.shortLabel ?? "Apps"}
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-56 rounded-lg border bg-white p-1 shadow-lg">
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                app.id === currentAppId ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
              }`}
            >
              <span className={cn("h-2 w-2 rounded-full", app.color)} />
              {app.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
