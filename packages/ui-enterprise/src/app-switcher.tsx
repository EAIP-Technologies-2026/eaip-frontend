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
        className="flex items-center gap-2 rounded-button p-2 text-text-secondary transition-smooth hover:bg-surface-tertiary hover:text-text"
        aria-label={`Switch app, currently ${current?.shortLabel ?? "Apps"}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className={cn("h-3 w-3 rounded-full", current?.color ?? "bg-text-muted")} />
        <span className="hidden text-sm font-medium text-text md:block">
          {current?.shortLabel ?? "Apps"}
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 z-50 mt-2 w-56 rounded-card border border-border bg-surface p-1 shadow-elevated" role="menu">
          {apps.map((app) => (
            <a
              key={app.id}
              href={app.href}
              className={[
                "flex items-center gap-2 rounded-button px-3 py-2 text-sm transition-smooth",
                app.id === currentAppId
                  ? "bg-primary-subtle text-primary"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text",
              ].join(" ")}
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
