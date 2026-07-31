export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "./enhanced-card";
export type { CardProps, CardVariant } from "./enhanced-card";

export { Dialog } from "./enhanced-dialog";
export type { DialogProps, DialogSize } from "./enhanced-dialog";

export { Tabs } from "./enhanced-tabs";
export type { TabsProps, Tab, TabsVariant } from "./enhanced-tabs";

export { Accordion } from "./enhanced-accordion";
export type { AccordionProps, AccordionItem, AccordionSize } from "./enhanced-accordion";

export { Stepper } from "./enhanced-stepper";
export type { StepperProps, Step } from "./enhanced-stepper";

export { Pagination } from "./enhanced-pagination";
export type { PaginationProps, PaginationSize } from "./enhanced-pagination";

export { Drawer } from "./enhanced-drawer";
export type { DrawerProps, DrawerSize } from "./enhanced-drawer";

import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";

// Tooltip
export interface TooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top", className, ...props }: TooltipProps) {
  const positionClass = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[position];
  return (
    <div className={cn("group relative inline-flex", className)} {...props}>
      {children}
      <div
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-xs rounded-button bg-text px-2.5 py-1 text-xs text-text-inverse opacity-0 shadow-lg transition-smooth group-hover:opacity-100",
          positionClass,
        )}
        role="tooltip"
      >
        {content}
      </div>
    </div>
  );
}

// Popover
export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
}

export function Popover({ trigger, children, className, ...props }: PopoverProps) {
  return (
    <div className={cn("group relative inline-block", className)} {...props}>
      {trigger}
      <div className="absolute right-0 z-50 mt-2 hidden w-56 rounded-card border border-border bg-surface p-2 shadow-elevated group-hover:block">
        {children}
      </div>
    </div>
  );
}

// Divider
export function Divider({ className, ...props }: HTMLAttributes<HTMLHRElement>) {
  return (
    <hr
      className={cn("border-0 border-t border-border", className)}
      {...props}
    />
  );
}

// Alert
export { Alert } from "./alert";
export type { AlertProps, AlertVariant } from "./alert";

// Toast
export { Toast, ToastContainer } from "./toast";
export type { ToastProps, ToastVariant, ToastContainerProps } from "./toast";

// Banner
export { Banner } from "./banner";
export type { BannerProps, BannerVariant } from "./banner";

// DropdownMenu
export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu";
export type {
  DropdownMenuProps,
  DropdownMenuItemProps,
  DropdownMenuLabelProps,
} from "./dropdown-menu";

// TabNav
export { TabNav } from "./tab-nav";
export type { TabNavProps, TabNavItem } from "./tab-nav";

// Sidebar
export { Sidebar } from "./sidebar";
export type { SidebarProps, SidebarItem } from "./sidebar";

// LoginShell
export { LoginShell } from "./login-shell";
export type { LoginShellProps } from "./login-shell";
