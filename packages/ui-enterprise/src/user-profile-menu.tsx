"use client";

import { useAuth } from "@eaip/auth";
import { useEffect, useState } from "react";
import { useOnClickOutside } from "@eaip/hooks";
import { Avatar } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";

export function UserProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

  // Close on Escape for accessibility
  useEffect(() => {
    if (!open) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  if (!user) return null;

  const primaryRole = user.roles?.includes("admin") ? "Admin" : (user.roles?.[0] ?? "User");

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="border-border/40 bg-surface/80 text-text-secondary hover:border-border hover:bg-surface hover:text-text focus-visible:ring-primary flex items-center gap-2 rounded-full border px-1.5 py-1 pr-3 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none"
        aria-label={`${user.name} profile menu`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} size="sm" />
        <span className="text-text hidden max-w-[120px] truncate text-sm font-medium md:block">
          {user.name}
        </span>
        <EnterpriseIcon
          name="chevronDown"
          size={12}
          className={`text-text-muted hidden transition-transform duration-200 md:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          className="border-border bg-surface shadow-elevated absolute right-0 z-50 mt-2 w-64 rounded-xl border p-2"
          role="menu"
          aria-label="Account menu"
        >
          <div className="border-border border-b px-3 py-2.5">
            <p className="text-text truncate text-sm font-semibold">{user.name}</p>
            <p className="bg-primary/10 text-primary mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium">
              {primaryRole}
            </p>
            <p className="text-text-muted mt-1.5 truncate text-xs">{user.email}</p>
          </div>
          <div className="py-1">
            <div className="text-text-muted/60 px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase">
              Account
            </div>
            <button
              type="button"
              onClick={() => {
                void handleLogout();
              }}
              className="text-danger hover:bg-danger-subtle focus-visible:ring-danger/30 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              role="menuitem"
            >
              <EnterpriseIcon name="logout" size={16} />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
