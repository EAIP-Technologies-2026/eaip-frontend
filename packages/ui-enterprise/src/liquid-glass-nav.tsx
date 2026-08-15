"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePlatformStore } from "@eaip/state";
import { useReducedMotion } from "@eaip/motion";
import { cn } from "@eaip/utilities";
import { EnterpriseIcon } from "./icon";
import { getNavigationForApp } from "./navigation";
import type { NavigationItem } from "./types";
import { NotificationBell } from "./notification-bell";
import { ThemeSwitcher } from "./theme-switcher";
import { UserProfileMenu } from "./user-profile-menu";

export interface LiquidGlassNavProps {
  appId: string;
}

function routeMatches(pathname: string, href: string) {
  return pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
}

export function LiquidGlassNav({ appId }: LiquidGlassNavProps) {
  const { activeRoute, setActiveRoute } = usePlatformStore();
  const navigation = getNavigationForApp(appId);
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const reduced = useReducedMotion();
  const primaryItems = navigation.items.slice(0, 5);
  const secondaryItems = navigation.items.slice(5);
  const activePath = activeRoute;
  const moreActive = secondaryItems.some((item) => routeMatches(activePath, item.href));

  const updatePill = useCallback(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;
    const target = Array.from(nav.querySelectorAll<HTMLElement>("[data-nav-active=\"true\"]")).find(
      (element) => element.offsetParent !== null,
    );
    if (!target) {
      pill.style.opacity = "0";
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    pill.style.left = `${String(targetRect.left - navRect.left)}px`;
    pill.style.top = `${String(targetRect.top - navRect.top)}px`;
    pill.style.width = `${String(targetRect.width)}px`;
    pill.style.height = `${String(targetRect.height)}px`;
    pill.style.opacity = "1";
  }, []);

  useEffect(() => {
    let frame: number | undefined;
    if (typeof requestAnimationFrame === "function") {
      frame = requestAnimationFrame(updatePill);
    }
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updatePill) : null;
    if (observer && navRef.current) observer.observe(navRef.current);
    window.addEventListener("resize", updatePill);
    return () => {
      if (typeof cancelAnimationFrame === "function" && frame !== undefined) cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", updatePill);
    };
  }, [activeRoute, moreOpen, updatePill]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("keydown", closeOnEscape); };
  }, []);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (reduced || !navRef.current) return;
      const rect = navRef.current.getBoundingClientRect();
      navRef.current.style.setProperty("--glare-x", `${String(((event.clientX - rect.left) / rect.width) * 100)}%`);
      navRef.current.style.setProperty("--glare-y", `${String(((event.clientY - rect.top) / rect.height) * 100)}%`);
    },
    [reduced],
  );

  function navigate(item: NavigationItem) {
    setMoreOpen(false);
    setActiveRoute(item.href);
  }

  function renderItem(item: NavigationItem, mobile = false) {
    const active = routeMatches(activePath, item.href);
    return (
      <Link
        key={item.id}
        href={item.href}
        onClick={() => { navigate(item); }}
        aria-current={active ? "page" : undefined}
        data-nav-active={active ? "true" : undefined}
        className={cn("nav-item", active && "nav-item--active", mobile && "nav-item--mobile")}
      >
        <EnterpriseIcon name={item.icon} size={mobile ? 18 : 16} />
        <span>{item.label}</span>
      </Link>
    );
  }

  return (
    <nav ref={navRef} className="nav-glass" aria-label="Enterprise Console navigation" onMouseMove={handleMouseMove}>
      <span className="nav-glare" aria-hidden="true" />
      <span ref={pillRef} className="nav-pill" aria-hidden="true" />

      <Link href="/dashboard" className="nav-brand" aria-label="EAIP Dashboard" onClick={() => { setActiveRoute("/dashboard"); }}>
        <EnterpriseIcon name="layers" size={18} />
      </Link>

      <span className="nav-separator" aria-hidden="true" />
      <div className="nav-primary-items">
        {primaryItems.map((item) => renderItem(item))}
      </div>

      {secondaryItems.length > 0 ? (
        <div className="nav-more-wrap">
          <button
            type="button"
            className={cn("nav-item nav-more-button", moreActive && "nav-item--active")}
            data-nav-active={moreActive ? "true" : undefined}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            aria-label="More destinations"
            onClick={() => { setMoreOpen((open) => !open); }}
          >
            <EnterpriseIcon name="moreHorizontal" size={16} />
            <span>More</span>
            <EnterpriseIcon name={moreOpen ? "chevronUp" : "chevronDown"} size={13} />
          </button>
          {moreOpen ? (
            <div className="nav-more-menu liquid-glass" role="menu" aria-label="More destinations">
              <p className="nav-more-label">Platform</p>
              {secondaryItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  role="menuitem"
                  onClick={() => { navigate(item); }}
                  className={cn("nav-more-item", routeMatches(activePath, item.href) && "nav-more-item--active")}
                >
                  <EnterpriseIcon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <span className="nav-separator" aria-hidden="true" />
      <div className="nav-utilities">
        <ThemeSwitcher compact />
        <NotificationBell />
        <UserProfileMenu />
      </div>

      <div className="nav-mobile-items">
        {primaryItems.slice(0, 4).map((item) => renderItem(item, true))}
        <div className="nav-mobile-more-wrap">
          <button
            type="button"
            className={cn("nav-item nav-item--mobile", moreActive && "nav-item--active")}
            data-nav-active={moreActive ? "true" : undefined}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            aria-label="More destinations"
            onClick={() => { setMoreOpen((open) => !open); }}
          >
            <EnterpriseIcon name="moreHorizontal" size={18} />
            <span>More</span>
          </button>
          {moreOpen ? (
            <div className="nav-more-menu nav-more-menu--mobile liquid-glass" role="menu" aria-label="More destinations">
              <p className="nav-more-label">Platform</p>
              {secondaryItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  role="menuitem"
                  onClick={() => { navigate(item); }}
                  className={cn("nav-more-item", routeMatches(activePath, item.href) && "nav-more-item--active")}
                >
                  <EnterpriseIcon name={item.icon} size={16} />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="nav-more-utilities">
                <ThemeSwitcher compact />
                <NotificationBell />
                <UserProfileMenu />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
