import { cn } from "@eaip/utilities";
import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "card" | "elevated";
  liquid?: boolean;
}

export function Card({
  children,
  padding = "md",
  shadow = "card",
  liquid = false,
  className,
  ...props
}: CardProps) {
  const liquidStyles = liquid
    ? "bg-surface-glass backdrop-blur-xl saturate-150 border-white/[0.18] dark:border-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_16px_rgba(17,24,39,0.05)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_4px_16px_rgba(0,0,0,0.3)] hover:translate-y-[-2px] hover:shadow-elevated hover:border-primary/20"
    : "";

  return (
    <div
      className={cn(
        "rounded-card border transition-all duration-280",
        liquid ? liquidStyles : "border-border bg-surface",
        !liquid && shadow === "card" && "shadow-card hover:shadow-elevated",
        !liquid && shadow === "elevated" && "shadow-elevated",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ children, action, className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border pb-3 mb-3",
        className,
      )}
      {...props}
    >
      <div className="flex-1">{children}</div>
      {action ? <div className="flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: "h2" | "h3" | "h4";
}

export function CardTitle({ children, as: Component = "h3", className, ...props }: CardTitleProps) {
  return (
    <Component
      className={cn("text-base font-semibold text-text", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn("text-sm text-text-secondary", className)} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 border-t border-border pt-3 mt-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
