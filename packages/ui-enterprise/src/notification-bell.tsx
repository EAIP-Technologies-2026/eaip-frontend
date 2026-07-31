"use client";

import { usePlatformStore } from "@eaip/state";
import { useState } from "react";
import { useOnClickOutside } from "@eaip/hooks";
import { EnterpriseIcon } from "@eaip/icons";

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
        className="relative rounded-button p-2 text-text-secondary transition-smooth hover:bg-surface-tertiary hover:text-text"
        aria-label={`Notifications${unread > 0 ? `, ${String(unread)} unread` : ""}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <EnterpriseIcon name="bell" size={20} />
        {unread > 0 ? (
          <span
            className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-text-inverse"
            aria-hidden="true"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-card border border-border bg-surface p-2 shadow-elevated">
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium text-text">Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <p className="px-3 py-4 text-sm text-text-secondary">No notifications yet.</p>
          ) : (
            <ul className="max-h-64 overflow-auto">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={[
                    "border-b border-border px-3 py-2 text-sm last:border-0",
                    notification.read ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-text">{notification.title}</p>
                      <p className="text-xs text-text-muted">{notification.message}</p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read ? (
                        <button
                          type="button"
                          onClick={() => {
                            markNotificationRead(notification.id);
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Read
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          removeNotification(notification.id);
                        }}
                        className="text-xs text-danger hover:underline"
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
