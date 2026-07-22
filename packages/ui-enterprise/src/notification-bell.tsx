"use client";

import { usePlatformStore } from "@eaip/state";
import { useState } from "react";
import { useOnClickOutside } from "@eaip/hooks";

export function NotificationBell() {
  const { notifications, unreadNotificationCount, markNotificationRead, removeNotification } =
    usePlatformStore();
  const [open, setOpen] = useState(false);
  const ref = useOnClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

  const unread = unreadNotificationCount();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        className="relative rounded-lg p-2 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border bg-white p-2 shadow-lg">
          <div className="border-b px-3 py-2">
            <p className="text-sm font-medium text-gray-900">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <p className="px-3 py-4 text-sm text-gray-500">No notifications yet.</p>
          ) : (
            <ul className="max-h-64 overflow-auto">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`border-b px-3 py-2 text-sm last:border-0 ${
                    notification.read ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.message}</p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read ? (
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(notification.id);
                          }}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Mark read
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          removeNotification(notification.id);
                        }}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
