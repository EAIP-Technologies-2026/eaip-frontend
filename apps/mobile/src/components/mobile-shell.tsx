"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@eaip/utilities";
import { EnterpriseIcon, ToastContainer } from "@eaip/ui-enterprise";

const tabs = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "layoutDashboard" },
  { id: "memory", label: "Memory", href: "/memory", icon: "database" },
  { id: "actions", label: "Actions", href: "/actions", icon: "zap" },
] as const;

export interface MobileShellProps {
  children: ReactNode;
  pageTitle?: string;
}

export function MobileShell({ children, pageTitle }: MobileShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-surface-secondary">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="flex h-14 items-center px-4">
          <h1 className="text-lg font-semibold text-text">{pageTitle ?? "EAIP"}</h1>
        </div>
      </header>

      <main id="main-content" className="flex-1 px-4 pb-32 pt-4">{children}</main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-surface/90 backdrop-blur-md"
        aria-label="Primary navigation"
      >
        <div
          className="mx-auto flex max-w-md items-center justify-around"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-smooth",
                  active ? "text-primary" : "text-text-muted",
                )}
                aria-current={active ? "page" : undefined}
              >
                <EnterpriseIcon name={tab.icon} size={22} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <ToastContainer />
    </div>
  );
}
