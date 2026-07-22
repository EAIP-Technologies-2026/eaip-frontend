"use client";

import { usePlatformStore } from "@eaip/state";
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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <span className="block h-4 w-5">
              <span className="mb-1 block h-0.5 w-full bg-gray-700" />
              <span className="mb-1 block h-0.5 w-full bg-gray-700" />
              <span className="block h-0.5 w-full bg-gray-700" />
            </span>
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

      <div className="border-b bg-gray-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <Breadcrumbs items={breadcrumbs} />
          {pageTitle ? <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1> : null}
        </div>
      </div>

      <GlobalSearchDialog />
      <CommandPalette />
    </>
  );
}
