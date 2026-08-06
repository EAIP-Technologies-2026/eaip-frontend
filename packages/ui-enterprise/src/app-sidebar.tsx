"use client";

import { useEffect, useRef } from "react";
import { EnterpriseIcon } from "./icon";
import { useReducedMotion, durationTokens, easingTokens } from "@eaip/motion";

export interface NavChildItem {
  id: string;
  label: string;
  href: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavChildItem[];
}

export interface AppSidebarProps {
  /** Navigation categories or list items */
  items?: NavItem[];
  /** Application or workspace title display */
  title?: string;
  /** Whether the sidebar is collapsed (desktop mode) */
  collapsed?: boolean;
  /** Callback to toggle collapse state */
  onToggleCollapse?: () => void;
  /** Whether mobile overlay drawer is open */
  mobileOpen?: boolean;
  /** Callback to close mobile overlay drawer */
  onMobileClose?: () => void;
  /** Currently active route href */
  activeHref?: string;
  /** Callback fired when a navigation item is clicked */
  onNavigate?: (href: string) => void;
  /** Additional CSS class names */
  className?: string;
}

export function AppSidebar({
  items = [],
  title = "Navigation",
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
  activeHref = "/",
  onNavigate,
  className = "",
}: AppSidebarProps) {
  const prefersReducedMotion = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen && onMobileClose) {
        onMobileClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, onMobileClose]);

  const transitionStyle = prefersReducedMotion
    ? { transitionDuration: "0.01ms" }
    : {
        transitionProperty: "width, transform, opacity",
        transitionDuration: durationTokens.medium,
        transitionTimingFunction: easingTokens.premium,
      };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen ? (
        <div
          ref={overlayRef}
          role="presentation"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm md:hidden"
        />
      ) : null}

      {/* Main Sidebar Container */}
      <aside
        aria-label="Sidebar Navigation"
        style={transitionStyle}
        className={`border-border/50 bg-surface/90 fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] border-r backdrop-blur-md ${
          collapsed ? "w-20" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} ${className}`}
      >
        <div className="flex h-full flex-col">
          {/* Header section */}
          <div className="border-border/50 flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white">
                <EnterpriseIcon name="layers" size={16} />
              </div>
              {!collapsed ? (
                <div className="overflow-hidden">
                  <p className="text-text truncate text-sm font-semibold">{title}</p>
                  <p className="text-text-muted text-[10px]">Enterprise Workspace</p>
                </div>
              ) : null}
            </div>

            {onToggleCollapse ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="rounded-button text-text-muted hover:bg-surface-tertiary hover:text-text focus:ring-primary hidden p-1 focus:ring-2 focus:outline-none md:block"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <EnterpriseIcon name={collapsed ? "chevronRight" : "chevronLeft"} size={16} />
              </button>
            ) : null}
          </div>

          {/* Navigation Items */}
          <nav aria-label="Main Navigation" className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onNavigate) onNavigate(item.href);
                      }}
                      aria-current={isActive ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`group rounded-button focus:ring-primary relative flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors focus:ring-2 focus:outline-none ${
                        isActive
                          ? "bg-primary-subtle text-primary font-semibold"
                          : "text-text-secondary hover:bg-surface-tertiary hover:text-text"
                      } ${collapsed ? "justify-center px-2" : ""}`}
                    >
                      {isActive ? (
                        <span
                          className="bg-primary absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                          aria-hidden="true"
                        />
                      ) : null}

                      <EnterpriseIcon
                        name={item.icon ?? "fileText"}
                        size={18}
                        className={`shrink-0 ${isActive ? "text-primary" : "text-text-muted group-hover:text-text"}`}
                      />

                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </a>

                    {/* Sub-items */}
                    {!collapsed && item.children && item.children.length > 0 ? (
                      <ul className="mt-1 space-y-1 pl-9">
                        {item.children.map((child) => {
                          const isChildActive = activeHref === child.href;
                          return (
                            <li key={child.id}>
                              <a
                                href={child.href}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (onNavigate) onNavigate(child.href);
                                }}
                                aria-current={isChildActive ? "page" : undefined}
                                className={`rounded-button focus:ring-primary block px-3 py-1.5 text-xs font-medium transition-colors focus:ring-2 focus:outline-none ${
                                  isChildActive
                                    ? "bg-primary-subtle text-primary font-semibold"
                                    : "text-text-secondary hover:bg-surface-tertiary hover:text-text"
                                }`}
                              >
                                {child.label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer operational status */}
          <div className="border-border/50 text-text-secondary border-t p-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-success h-2 w-2 rounded-full" />
              {!collapsed ? <span>System Operational</span> : null}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

/** Backward compatible alias */
export const Sidebar = AppSidebar;
