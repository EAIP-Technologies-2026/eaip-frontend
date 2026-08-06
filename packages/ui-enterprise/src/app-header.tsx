"use client";

import type React from "react";
import { EnterpriseIcon } from "./icon";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";
import { UserMenu, type UserMenuUser } from "./user-menu";
import type { Workspace } from "./types";

export interface AppHeaderProps {
  /** Title of the current application or section */
  appTitle?: string;
  /** Current active app identifier */
  appId?: string;
  /** Whether the sidebar is currently open or expanded */
  sidebarOpen?: boolean;
  /** Callback fired when the sidebar toggle button is clicked */
  onSidebarToggle?: () => void;
  /** Workspaces list for WorkspaceSwitcher */
  workspaces?: Workspace[];
  /** Currently active workspace */
  activeWorkspace?: Workspace;
  /** Callback fired when active workspace is changed */
  onWorkspaceChange?: (workspace: Workspace) => void;
  /** Breadcrumb items to display */
  breadcrumbs?: BreadcrumbItem[];
  /** User object for UserMenu */
  user?: UserMenuUser;
  /** Callback fired when sign out is clicked */
  onSignOut?: () => void;
  /** Page title for sub-header breadcrumb section */
  pageTitle?: string;
  /** Extra right-hand action controls */
  children?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
}

export function AppHeader({
  appTitle = "Enterprise Platform",
  sidebarOpen = true,
  onSidebarToggle,
  workspaces,
  activeWorkspace,
  onWorkspaceChange,
  breadcrumbs = [],
  user,
  onSignOut,
  pageTitle,
  children,
  className = "",
}: AppHeaderProps) {
  return (
    <header
      role="banner"
      className={`border-border/50 bg-surface/80 sticky top-0 z-30 flex flex-col border-b backdrop-blur-md ${className}`}
    >
      {/* Skip link for keyboard accessibility */}
      <a
        href="#main-content"
        className="focus:rounded-button focus:bg-primary focus:ring-primary sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:text-white focus:ring-2 focus:ring-offset-2 focus:outline-none"
      >
        Skip to main content
      </a>

      <div className="flex h-16 items-center justify-between px-4">
        {/* Left section: Hamburger toggle, App Brand & Workspace Switcher */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSidebarToggle}
            className="rounded-button text-text-secondary hover:bg-surface-tertiary hover:text-text focus:ring-primary p-2 transition-colors focus:ring-2 focus:outline-none"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={sidebarOpen}
          >
            <EnterpriseIcon name="menu" size={20} />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-text text-sm font-semibold tracking-tight md:text-base">
              {appTitle}
            </span>
          </div>

          <WorkspaceSwitcher
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
            onWorkspaceChange={onWorkspaceChange}
          />
        </div>

        {/* Right section: Action items and User Menu */}
        <div className="flex items-center gap-2">
          {children}
          {user ? <UserMenu user={user} onSignOut={onSignOut} /> : null}
        </div>
      </div>

      {/* Sub-header Breadcrumbs section */}
      {breadcrumbs.length > 0 || pageTitle ? (
        <div className="border-border/40 bg-surface-secondary/40 border-t px-4 py-2 text-xs md:text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Breadcrumbs items={breadcrumbs} />
            {pageTitle ? (
              <h1 className="text-text text-sm font-semibold tracking-tight md:text-base">
                {pageTitle}
              </h1>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** Backward compatible alias */
export const Header = AppHeader;
