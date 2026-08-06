"use client";

import { useState, useEffect } from "react";
import { useOnClickOutside } from "@eaip/hooks";
import { EnterpriseIcon } from "./icon";
import { Avatar } from "@eaip/ui-primitives";
import { useReducedMotion, durationTokens, easingTokens } from "@eaip/motion";

export interface UserMenuUser {
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
}

export interface UserMenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick?: () => void;
  danger?: boolean;
}

export interface UserMenuProps {
  /** User object details */
  user?: UserMenuUser;
  /** Callback fired when user clicks sign out */
  onSignOut?: () => void;
  /** Custom extra menu options */
  menuItems?: UserMenuItem[];
  /** Additional CSS class names */
  className?: string;
}

const defaultUser: UserMenuUser = {
  name: "Enterprise Admin",
  email: "admin@eaip.internal",
  role: "System Administrator",
};

export function UserMenu({
  user = defaultUser,
  onSignOut,
  menuItems = [],
  className = "",
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useOnClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

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
        aria-label={`${user.name} profile menu`}
        aria-haspopup="true"
        aria-expanded={open}
        className="rounded-button text-text-secondary hover:bg-surface-tertiary hover:text-text focus:ring-primary flex items-center gap-2 p-1.5 transition-colors focus:ring-2 focus:outline-none"
      >
        <Avatar name={user.name} size="sm" />
        <span className="text-text hidden text-xs font-medium md:text-sm lg:block">
          {user.name}
        </span>
        <EnterpriseIcon name="chevronDown" size={14} className="text-text-muted hidden lg:block" />
      </button>

      {open ? (
        <div
          role="menu"
          tabIndex={-1}
          style={dropdownStyle}
          className="rounded-card border-border bg-surface shadow-elevated absolute right-0 z-50 mt-2 w-60 border p-1 focus:outline-none"
        >
          {/* User info section */}
          <div className="border-border/50 border-b px-3 py-2">
            <p className="text-text truncate text-xs font-semibold md:text-sm">{user.name}</p>
            <p className="text-text-muted truncate text-xs">{user.email}</p>
            {user.role ? (
              <span className="bg-primary-subtle text-primary mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium">
                {user.role}
              </span>
            ) : null}
          </div>

          {/* Custom menu items */}
          {menuItems.map((item) => {
            return (
              <button
                key={item.id}
                role="menuitem"
                type="button"
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setOpen(false);
                }}
                className={`rounded-button text-text-secondary hover:bg-surface-tertiary hover:text-text flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors md:text-sm ${
                  item.danger ? "text-danger hover:bg-danger-subtle" : ""
                }`}
              >
                {item.icon ? <EnterpriseIcon name={item.icon} size={16} /> : null}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Sign Out item */}
          {onSignOut ? (
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                onSignOut();
                setOpen(false);
              }}
              className="rounded-button text-danger hover:bg-danger-subtle mt-1 flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors md:text-sm"
            >
              <EnterpriseIcon name="logout" size={16} />
              <span>Sign out</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/** Backward compatible alias */
export const UserProfileMenu = UserMenu;
