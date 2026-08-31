"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@eaip/utilities";
import {
  EnterpriseIcon,
  ThemeSwitcher,
  ToastContainer,
  GlobalSearchDialog,
  CommandPalette,
  EAIPAtmosphere,
} from "@eaip/ui-enterprise";

const tabs = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: "layoutDashboard" },
  { id: "memory", label: "Memory", href: "/memory", icon: "database" },
  { id: "actions", label: "Actions", href: "/actions", icon: "zap" },
] as const;

const titleMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/memory": "Memory",
  "/actions": "Actions",
};

function routeTitle(pathname: string): string {
  if (titleMap[pathname]) return titleMap[pathname];
  const match = Object.keys(titleMap).find((k) => pathname.startsWith(`${k}/`));
  return match ? (titleMap[match] ?? "EAIP") : "EAIP";
}

export interface MobileShellProps {
  children: ReactNode;
  pageTitle?: string;
}

export function MobileShell({ children, pageTitle }: MobileShellProps) {
  const pathname = usePathname();

  // Login and unauthorized are full-screen surfaces — do not wrap them in the
  // app chrome (header / bottom tab bar) to avoid a nested <main> and a stray
  // navigation bar on unauthenticated screens.
  if (pathname === "/login" || pathname === "/unauthorized") {
    return <>{children}</>;
  }

  return (
    <div className="bg-background flex min-h-screen flex-col overflow-hidden">
      <EAIPAtmosphere intensity="dashboard" showParticles={false} />

      <header className="border-border/80 bg-surface-glass sticky top-0 z-20 flex h-14 items-center justify-between border-b px-4 backdrop-blur-xl">
        <h1 className="text-text text-lg font-semibold tracking-tight">
          {pageTitle ?? routeTitle(pathname)}
        </h1>
        <ThemeSwitcher />
      </header>

      <main id="main-content" className="relative z-10 flex-1 px-4 pt-4 pb-32">
        {children}
      </main>

      <nav
        className="bg-surface-glass fixed right-0 bottom-0 left-0 z-30 border-t border-white/[0.1] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-2xl"
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
                  "transition-smooth flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium",
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
      <GlobalSearchDialog />
      <CommandPalette />
    </div>
  );
}
