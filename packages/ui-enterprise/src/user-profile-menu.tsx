"use client";

import { useAuth } from "@eaip/auth";
import { useState } from "react";
import { useOnClickOutside } from "@eaip/hooks";

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
        className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden text-sm font-medium text-gray-700 md:block">{user.name}</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border bg-white p-2 shadow-lg">
          <div className="border-b px-3 py-2">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
