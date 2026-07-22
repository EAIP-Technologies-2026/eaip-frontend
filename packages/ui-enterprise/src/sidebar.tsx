"use client";

import Link from "next/link";
import { usePlatformStore } from "@eaip/state";
import { getNavigationForApp } from "./navigation";
import { EnterpriseIcon } from "./icon";
import { cn } from "@eaip/utilities";

export interface SidebarProps {
  appId: string;
}

export function Sidebar({ appId }: SidebarProps) {
  const { sidebarOpen, activeRoute, setActiveRoute } = usePlatformStore();
  const navigation = getNavigationForApp(appId);

  function handleNavClick(href: string) {
    setActiveRoute(href);
  }

  return (
    <aside
      className={cn(
        "fixed top-16 left-0 z-20 h-[calc(100vh-4rem)] border-r bg-white transition-all duration-200",
        sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-0 md:translate-x-0",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
            {navigation.label}
          </p>
        </div>
        <nav className="flex-1 overflow-auto p-3">
          <ul className="space-y-1">
            {navigation.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => {
                    handleNavClick(item.href);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    activeRoute === item.href
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <EnterpriseIcon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
                {item.children ? (
                  <ul className="mt-1 space-y-1 pl-8">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          onClick={() => {
                            handleNavClick(child.href);
                          }}
                          className={cn(
                            "block rounded-lg px-3 py-1.5 text-sm",
                            activeRoute === child.href
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-100",
                          )}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-4 text-xs text-gray-400">EAIP Enterprise AI Platform</div>
      </div>
    </aside>
  );
}
