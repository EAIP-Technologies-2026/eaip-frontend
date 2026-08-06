"use client";

import type { ReactNode, HTMLAttributes } from "react";
import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useOnClickOutside } from "@eaip/hooks";
import { EnterpriseIcon } from "@eaip/icons";

interface ContextMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  coords: { x: number; y: number };
  setCoords: (coords: { x: number; y: number }) => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenuContext() {
  const ctx = useContext(ContextMenuContext);
  if (!ctx) throw new Error("ContextMenu components must be inside <ContextMenu>");
  return ctx;
}

export interface ContextMenuRootProps {
  children: ReactNode;
}

export function ContextMenuRoot({ children }: ContextMenuRootProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  return (
    <ContextMenuContext.Provider value={{ open, setOpen, coords, setCoords }}>
      <div className="relative inline-block" data-slot="context-menu">
        {children}
      </div>
    </ContextMenuContext.Provider>
  );
}

export interface ContextMenuTriggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ContextMenuTrigger({
  children,
  className = "",
  ...props
}: ContextMenuTriggerProps) {
  const { setOpen, setCoords } = useContextMenuContext();

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    setCoords({ x: e.clientX, y: e.clientY });
    setOpen(true);
  }

  return (
    <div
      onContextMenu={handleContextMenu}
      data-slot="context-menu-trigger"
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ContextMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function ContextMenuContent({
  children,
  className = "",
  ...props
}: ContextMenuContentProps) {
  const { open, setOpen, coords } = useContextMenuContext();
  const menuRef = useOnClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      data-slot="context-menu-content"
      data-state="open"
      style={{ position: "fixed", top: `${String(coords.y)}px`, left: `${String(coords.x)}px` }}
      className={`rounded-card border-border bg-surface shadow-elevated z-50 min-w-[160px] border py-1 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ContextMenuItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  icon?: string;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

export function ContextMenuItem({
  children,
  icon,
  danger,
  disabled,
  onSelect,
  className = "",
  ...props
}: ContextMenuItemProps) {
  const { setOpen } = useContextMenuContext();

  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      onClick={() => {
        if (!disabled) {
          if (onSelect) onSelect();
          setOpen(false);
        }
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          if (onSelect) onSelect();
          setOpen(false);
        }
      }}
      data-slot="context-menu-item"
      className={[
        "focus:bg-surface-tertiary flex cursor-pointer items-center gap-2 px-3 py-2 text-xs transition-colors focus:outline-none md:text-sm",
        disabled
          ? "cursor-not-allowed opacity-50"
          : danger
            ? "text-danger hover:bg-danger-subtle"
            : "text-text hover:bg-surface-tertiary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon ? <EnterpriseIcon name={icon as never} size={16} /> : null}
      <span>{children}</span>
    </div>
  );
}

export const ContextMenu = Object.assign(ContextMenuRoot, {
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
});
