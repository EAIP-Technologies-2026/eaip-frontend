"use client";

import { CommandPalette } from "./command-palette";
import { GlobalSearchDialog, GlobalSearchTrigger } from "./global-search";
import { ThemeSwitcher } from "./theme-switcher";
import { UserProfileMenu } from "./user-profile-menu";

export interface HeaderProps {
  appId: string;
  pageTitle?: string;
}

/**
 * Header — Minimal utility header above content.
 *
 * Contains: search, theme control, user profile.
 * The main navigation is handled by LiquidGlassNav.
 * This header is NOT sticky — it sits above the content area.
 */
export function Header(_props: HeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex-1" />

        <div className="hidden flex-1 items-center justify-center px-6 md:flex">
          <GlobalSearchTrigger />
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeSwitcher />
          <UserProfileMenu />
        </div>
      </div>

      <GlobalSearchDialog />
      <CommandPalette />
    </>
  );
}
