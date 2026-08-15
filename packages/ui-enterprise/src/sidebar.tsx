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

  const primaryItems = navigation.items.slice(0, 5);
  const platformItems = navigation.items.slice(5);

  return (
    <>
      {/* Desktop floating sidebar */}
      <aside
        className={cn(
          "nav-floating",
          !sidebarOpen && "nav-floating-hidden",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="px-4 py-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
                <EnterpriseIcon name="layers" size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text tracking-tight">{navigation.label}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Workspace</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-auto px-2 py-3">
            {/* Primary items */}
            <ul className="space-y-0.5">
              {primaryItems.map((item) => (
                <li key={item.id} className="relative">
                  <Link
                    href={item.href}
                    onClick={() => { handleNavClick(item.href); }}
                    aria-current={activeRoute === item.href ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      activeRoute === item.href
                        ? "bg-primary/[0.08] text-primary"
                        : "text-text-secondary hover:bg-surface-tertiary/50 hover:text-text",
                    )}
                  >
                    {/* Active indicator */}
                    {activeRoute === item.href && (
                      <span className="nav-indicator absolute left-0 top-1/2 h-5 -translate-y-1/2" aria-hidden="true" />
                    )}
                    <EnterpriseIcon
                      name={item.icon}
                      size={18}
                      className={cn(
                        "transition-colors duration-200",
                        activeRoute === item.href ? "text-primary" : "text-text-muted group-hover:text-text-secondary",
                      )}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </Link>
                  {item.children ? (
                    <ul className="mt-0.5 space-y-0.5 pl-10">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={child.href}
                            onClick={() => { handleNavClick(child.href); }}
                            aria-current={activeRoute === child.href ? "page" : undefined}
                            className={cn(
                              "block rounded-md px-3 py-1.5 text-xs transition-all duration-200",
                              activeRoute === child.href
                                ? "text-primary font-medium"
                                : "text-text-muted hover:text-text-secondary",
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

            {/* Platform items */}
            {platformItems.length > 0 && (
              <>
                <div className="my-3 mx-3">
                  <div className="divider-premium" />
                </div>
                <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-text-muted uppercase">
                  Platform
                </p>
                <ul className="space-y-0.5">
                  {platformItems.map((item) => (
                    <li key={item.id} className="relative">
                      <Link
                        href={item.href}
                        onClick={() => { handleNavClick(item.href); }}
                        aria-current={activeRoute === item.href ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                          activeRoute === item.href
                            ? "bg-primary/[0.08] text-primary"
                            : "text-text-secondary hover:bg-surface-tertiary/50 hover:text-text",
                        )}
                      >
                        {activeRoute === item.href && (
                          <span className="nav-indicator absolute left-0 top-1/2 h-5 -translate-y-1/2" aria-hidden="true" />
                        )}
                        <EnterpriseIcon
                          name={item.icon}
                          size={18}
                          className={cn(
                            "transition-colors duration-200",
                            activeRoute === item.href ? "text-primary" : "text-text-muted group-hover:text-text-secondary",
                          )}
                        />
                        <span className="tracking-tight">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </nav>

          {/* System status */}
          <div className="px-4 py-3 border-t border-border/30">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_var(--color-success)]" />
              <span className="text-[11px] text-text-muted">System Operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="nav-mobile" aria-label="Mobile navigation">
        <div className="flex items-center justify-around">
          {primaryItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => { handleNavClick(item.href); }}
              aria-current={activeRoute === item.href ? "page" : undefined}
              className={cn(
                "nav-mobile-item",
                activeRoute === item.href && "nav-mobile-item-active",
              )}
            >
              <EnterpriseIcon
                name={item.icon}
                size={20}
                className={cn(
                  "transition-colors duration-200",
                  activeRoute === item.href ? "text-primary" : "text-text-muted",
                )}
              />
              <span className="text-[10px] mt-0.5 truncate max-w-[4rem]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
