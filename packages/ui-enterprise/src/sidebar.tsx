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
          "fixed top-16 left-0 z-20 h-[calc(100vh-4rem)] border-r border-border/50 glass transition-all duration-300 ease-out",
          sidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:w-0 md:translate-x-0",
        )}
      >
      <div className="flex h-full flex-col">
        <div className="border-b border-border/60 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <EnterpriseIcon name="layers" size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{navigation.label}</p>
              <p className="text-[10px] text-text-muted">Enterprise Workspace</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-auto p-3">
          {/* Primary Navigation */}
          <ul className="space-y-0.5">
            {navigation.items.slice(0, 5).map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => {
                    handleNavClick(item.href);
                  }}
                  aria-current={activeRoute === item.href ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-smooth",
                    activeRoute === item.href
                      ? "bg-primary-subtle text-primary shadow-sm"
                      : "text-text-secondary hover:bg-surface-tertiary/70 hover:text-text",
                  )}
                >
                  {activeRoute === item.href && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary status-glow" aria-hidden="true" />
                  )}
                  <EnterpriseIcon
                    name={item.icon}
                    size={18}
                    className={cn(
                      "transition-smooth",
                      activeRoute === item.href ? "text-primary" : "text-text-muted group-hover:text-text",
                    )}
                  />
                  <span className="tracking-tight">{item.label}</span>
                </Link>
                {item.children ? (
                  <ul className="mt-0.5 space-y-0.5 pl-9">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          onClick={() => {
                            handleNavClick(child.href);
                          }}
                          aria-current={activeRoute === child.href ? "page" : undefined}
                          className={cn(
                            "block rounded-button px-3 py-1.5 text-sm transition-smooth",
                            activeRoute === child.href
                              ? "bg-primary-subtle text-primary font-medium"
                              : "text-text-secondary hover:bg-surface-tertiary/70 hover:text-text",
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

          {navigation.items.length > 5 && (
            <>
              <div className="my-3 px-3">
                <p className="text-[10px] font-semibold tracking-widest text-text-muted uppercase">Platform</p>
              </div>
              <ul className="space-y-0.5">
                {navigation.items.slice(5).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        handleNavClick(item.href);
                      }}
                      aria-current={activeRoute === item.href ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-smooth",
                        activeRoute === item.href
                          ? "bg-primary-subtle text-primary shadow-sm"
                          : "text-text-secondary hover:bg-surface-tertiary/70 hover:text-text",
                      )}
                    >
                      {activeRoute === item.href && (
                        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary status-glow" aria-hidden="true" />
                      )}
                      <EnterpriseIcon
                        name={item.icon}
                        size={18}
                        className={cn(
                          "transition-smooth",
                          activeRoute === item.href ? "text-primary" : "text-text-muted group-hover:text-text",
                        )}
                      />
                      <span className="tracking-tight">{item.label}</span>
                    </Link>
                    {item.children ? (
                      <ul className="mt-0.5 space-y-0.5 pl-9">
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={child.href}
                              onClick={() => {
                                handleNavClick(child.href);
                              }}
                              aria-current={activeRoute === child.href ? "page" : undefined}
                              className={cn(
                                "block rounded-button px-3 py-1.5 text-sm transition-smooth",
                                activeRoute === child.href
                                  ? "bg-primary-subtle text-primary font-medium"
                                  : "text-text-secondary hover:bg-surface-tertiary/70 hover:text-text",
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
            </>
          )}
        </nav>
        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-text-secondary">System Operational</span>
          </div>
        </div>
        <div className="border-t border-border/60 bg-surface-secondary/40 p-3">
          <p className="text-[10px] font-semibold tracking-widest text-text-muted uppercase text-center">
            EAIP v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}
