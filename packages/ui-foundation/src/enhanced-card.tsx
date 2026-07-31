import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";

export type CardVariant = "default" | "elevated" | "outlined" | "flat" | "interactive";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles: Record<CardVariant, string> = {
  default: "surface-card",
  elevated: "surface-card shadow-elevated",
  outlined: "border border-border/60 bg-surface rounded-card",
  flat: "bg-surface-secondary rounded-card border border-border/40",
  interactive: "surface-card cursor-pointer card-hover-lift",
};

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

export function Card({
  children,
  variant = "default",
  padding = "md",
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden transition-smooth",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn("flex items-center justify-between border-b border-border/60 px-5 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: CardProps) {
  return (
    <div className={cn("px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn("flex items-center justify-between border-t border-border/60 bg-surface-secondary/50 px-5 py-3.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}
