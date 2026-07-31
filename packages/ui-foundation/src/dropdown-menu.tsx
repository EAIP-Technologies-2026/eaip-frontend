import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@eaip/core";

export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end" | "center";
  side?: "bottom" | "top";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DropdownMenu({
  trigger,
  children,
  align = "start",
  side = "bottom",
  open: controlledOpen,
  onOpenChange,
  className,
  ...props
}: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    },
    [setOpen],
  );

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    },
    [setOpen],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, handleClickOutside, handleEscape]);

  const alignStyles = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  };

  const sideStyles = {
    bottom: "top-full mt-1",
    top: "bottom-full mb-1",
  };

  return (
    <div className={cn("relative inline-block", className)} {...props}>
      <div
        ref={triggerRef}
        onClick={() => { setOpen(!isOpen); }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            "absolute z-50 min-w-[180px] rounded-card border border-border bg-surface py-1 shadow-elevated",
            "animate-in fade-in",
            alignStyles[align],
            sideStyles[side],
          )}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  destructive?: boolean;
}

export function DropdownMenuItem({
  children,
  icon,
  destructive = false,
  className,
  ...props
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-smooth",
        destructive
          ? "text-danger hover:bg-danger-subtle"
          : "text-text hover:bg-surface-tertiary",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
      role="menuitem"
      {...props}
    >
      {icon && <span className="w-4 h-4 shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("my-1 border-t border-border", className)} {...props} />
  );
}

export interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DropdownMenuLabel({ children, className, ...props }: DropdownMenuLabelProps) {
  return (
    <div className={cn("px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider", className)} {...props}>
      {children}
    </div>
  );
}
