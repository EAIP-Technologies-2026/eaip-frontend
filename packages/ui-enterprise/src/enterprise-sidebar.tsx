"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";
import { usePlatformStore } from "@eaip/state";
import { cn } from "@eaip/utilities";
import { EnterpriseIcon } from "./icon";
import { getNavigationForApp } from "./navigation";
import type { NavigationItem } from "./types";

export interface EnterpriseSidebarProps {
  appId: string;
}

function routeMatches(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

function routeMatchesDeep(pathname: string, item: NavigationItem): boolean {
  if (routeMatches(pathname, item.href)) return true;
  if (item.children) {
    return item.children.some((child) => routeMatches(pathname, child.href));
  }
  return false;
}

export function EnterpriseSidebar({ appId }: EnterpriseSidebarProps) {
  const { activeRoute, setActiveRoute, sidebarOpen, setSidebarOpen } = usePlatformStore();
  const navigation = getNavigationForApp(appId);
  const navRef = useRef<HTMLElement>(null);

  const [mounted, setMounted] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-expand groups that contain the active route
  useEffect(() => {
    if (!mounted) return;
    const groupsToExpand = new Set<string>();
    for (const item of navigation.items) {
      if (item.children && routeMatchesDeep(activeRoute, item)) {
        groupsToExpand.add(item.id);
      }
    }
    if (groupsToExpand.size > 0) {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        for (const id of groupsToExpand) next.add(id);
        return next;
      });
    }
  }, [activeRoute, navigation.items, mounted]);

  // Close mobile drawer on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  // Keyboard navigation within sidebar
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!navRef.current) return;
      const focusable = navRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const focused = document.activeElement;
      if (!focusable.length || !focused || !navRef.current.contains(focused)) return;

      const idx = Array.from(focusable).indexOf(focused as HTMLElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = focusable[idx + 1] ?? focusable[0];
        next?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = focusable[idx - 1] ?? focusable[focusable.length - 1];
        prev?.focus();
      }
    }
    const el = navRef.current;
    el?.addEventListener("keydown", handleKeyDown);
    return () => el?.removeEventListener("keydown", handleKeyDown);
  }, [mounted]);

  const navigate = useCallback(
    (item: NavigationItem) => {
      setActiveRoute(item.href);
      setMobileOpen(false);
    },
    [setActiveRoute],
  );

  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const renderItem = (item: NavigationItem, depth = 0) => {
    const active = routeMatches(activeRoute, item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.has(item.id);
    const childActive = hasChildren && routeMatchesDeep(activeRoute, item);

    if (hasChildren && sidebarOpen) {
      return (
        <div key={item.id}>
          <button
            type="button"
            onClick={() => {
              toggleGroup(item.id);
            }}
            aria-expanded={isExpanded}
            className={cn(
              "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
              childActive
                ? "text-primary"
                : "text-text-secondary hover:bg-surface-secondary hover:text-text",
            )}
          >
            <EnterpriseIcon
              name={item.icon}
              size={18}
              className={cn(
                "shrink-0 transition-colors",
                childActive ? "text-primary" : "text-text-muted group-hover:text-text",
              )}
            />
            <span className="flex-1 truncate text-left">{item.label}</span>
            <EnterpriseIcon
              name="chevronDown"
              size={14}
              className={cn(
                "text-text-muted shrink-0 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            <div className="border-border/50 ml-3 space-y-0.5 border-l py-1 pl-3">
              {(item.children ?? []).map((child) => renderChildItem(child))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={() => {
          navigate(item);
        }}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
          active
            ? "bg-primary/10 text-primary"
            : "text-text-secondary hover:bg-surface-secondary hover:text-text",
          !sidebarOpen && "justify-center px-0",
          depth > 0 && "pl-6",
        )}
        title={!sidebarOpen ? item.label : undefined}
      >
        <EnterpriseIcon
          name={item.icon}
          size={sidebarOpen ? 18 : 20}
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-primary" : "text-text-muted group-hover:text-text",
          )}
        />
        {sidebarOpen && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  const renderChildItem = (child: NavigationItem) => {
    const active = routeMatches(activeRoute, child.href);
    return (
      <Link
        key={child.id}
        href={child.href}
        onClick={() => {
          navigate(child);
        }}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150",
          active
            ? "bg-primary/10 text-primary"
            : "text-text-muted hover:bg-surface-secondary hover:text-text-secondary",
        )}
      >
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
            active ? "bg-primary" : "bg-border",
          )}
        />
        <span className="truncate">{child.label}</span>
      </Link>
    );
  };

  const categories = ["OPERATE", "INTELLIGENCE", "GOVERN", "OBSERVE", "EXTEND"] as const;

  // Wait until mounted to avoid hydration mismatch with state
  if (!mounted) return null;

  const sidebarContent = (
    <>
      {/* Brand Header */}
      <div className="border-border/40 flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <Link
            href="/dashboard"
            className="bg-primary/10 text-primary hover:bg-primary/15 flex shrink-0 items-center justify-center rounded-lg p-1.5 transition-all duration-200 hover:scale-105"
          >
            <EnterpriseIcon name="layers" size={20} />
          </Link>
          {sidebarOpen && (
            <Link
              href="/dashboard"
              className="text-text hover:text-primary truncate text-sm font-semibold tracking-tight transition-colors"
            >
              EAIP Console
            </Link>
          )}
        </div>
        {sidebarOpen && (
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
            className="border-border/60 bg-surface-secondary/50 text-text-muted hover:border-border hover:text-text-secondary flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] transition-all"
            title="Search (⌘K)"
          >
            <EnterpriseIcon name="search" size={12} />
            <kbd className="font-mono text-[10px]">⌘K</kbd>
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav
        ref={navRef}
        aria-label="Main Navigation"
        className="hide-scrollbar flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-2.5 py-3"
      >
        {categories.map((category) => {
          const categoryItems = navigation.items.filter((item) => item.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="space-y-0.5">
              {sidebarOpen && (
                <div className="text-text-muted/70 px-3 pt-2 pb-1.5 text-[10px] font-bold tracking-[0.15em] uppercase select-none">
                  {category}
                </div>
              )}
              {categoryItems.map((item) => renderItem(item))}
            </div>
          );
        })}
      </nav>

      {/* Footer — collapse control only (profile moved to top-right header) */}
      <div className="border-border/40 shrink-0 border-t p-2.5">
        <button
          type="button"
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
          }}
          className="text-text-muted hover:bg-surface-secondary hover:text-text flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs transition-all duration-200"
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <EnterpriseIcon name={sidebarOpen ? "chevronLeft" : "chevronRight"} size={16} />
          {sidebarOpen && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          role="presentation"
          onClick={() => {
            setMobileOpen(false);
          }}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => {
          setMobileOpen(true);
        }}
        className="border-border bg-surface/95 fixed top-3 left-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg border shadow-lg backdrop-blur-xl md:hidden"
        aria-label="Open navigation"
      >
        <EnterpriseIcon name="menu" size={20} />
      </button>

      <aside
        aria-label="Sidebar Navigation"
        className={cn(
          "border-border/50 bg-surface/95 fixed inset-y-0 left-0 z-50 flex flex-col border-r backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          sidebarOpen ? "w-[250px]" : "w-[62px]",
          // Mobile: always overlay
          "max-md:w-[280px] max-md:translate-x-0",
          !mobileOpen && "max-md:-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
