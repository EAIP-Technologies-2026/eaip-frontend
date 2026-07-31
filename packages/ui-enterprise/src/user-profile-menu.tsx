"use client";

import { useAuth } from "@eaip/auth";
import { useState } from "react";
import { useOnClickOutside } from "@eaip/hooks";
import { Avatar } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

export function UserProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 rounded-button p-2 text-text-secondary transition-smooth hover:bg-surface-tertiary hover:text-text"
        aria-label={`${user.name} profile menu`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden text-sm font-medium text-text md:block">{user.name}</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-card border border-border bg-surface p-2 shadow-elevated" role="menu">
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium text-text">{user.name}</p>
            <p className="text-xs text-text-muted">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-button px-3 py-2 text-left text-sm text-danger transition-smooth hover:bg-danger-subtle"
          >
            <EnterpriseIcon name="logout" size={16} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
