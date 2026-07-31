"use client";

import { usePlatformStore } from "@eaip/state";
import { EnterpriseIcon } from "@eaip/icons";
import { AppSwitcher } from "./app-switcher";
import { Breadcrumbs } from "./breadcrumbs";
import { CommandPalette } from "./command-palette";
import { GlobalSearchDialog, GlobalSearchTrigger } from "./global-search";
import { NotificationBell } from "./notification-bell";
import { ThemeSwitcher } from "./theme-switcher";
import { UserProfileMenu } from "./user-profile-menu";
import { WorkspaceSwitcher } from "./workspace-switcher";

export interface HeaderProps {
  appId: string;
  pageTitle?: string;
}

export function Header({ appId, pageTitle }: HeaderProps) {
  const { breadcrumbs, toggleSidebar } = usePlatformStore();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 glass-panel px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-button p-2 text-text-secondary transition-smooth hover:bg-surface-tertiary/70 hover:text-text press-feedback"
            aria-label="Toggle sidebar"
          >
            <EnterpriseIcon name="menu" size={20} />
          </button>
          <AppSwitcher currentAppId={appId} />
          <WorkspaceSwitcher />
        </div>

        <div className="hidden flex-1 items-center justify-center px-6 md:flex">
          <GlobalSearchTrigger />
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <NotificationBell />
          <UserProfileMenu />
        </div>
      </header>

      <div className="border-b border-border/40 bg-surface/60 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between">
          <Breadcrumbs items={breadcrumbs} />
          {pageTitle ? (
            <h1 className="text-xl font-semibold text-text tracking-tight">{pageTitle}</h1>
          ) : null}
        </div>
      </div>

      <GlobalSearchDialog />
      <CommandPalette />
    </>
  );
}
