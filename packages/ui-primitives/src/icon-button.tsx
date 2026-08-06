"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";
import { Spinner } from "./spinner";

export type IconButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<IconButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-active border border-transparent shadow-button",
  secondary: "bg-surface-tertiary text-text hover:bg-surface-secondary border border-border/50",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-tertiary hover:text-text border border-transparent",
  outline: "bg-transparent text-text border border-border hover:bg-surface-tertiary",
  destructive: "bg-danger text-white hover:bg-danger/90 border border-transparent",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      "aria-label": ariaLabel,
      variant = "secondary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      ...props
    },
    ref,
  ) => {
    const isDisabled = (disabled ?? false) || isLoading;

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        aria-disabled={isDisabled ? "true" : undefined}
        disabled={isDisabled}
        data-slot="icon-button"
        data-variant={variant}
        data-size={size}
        data-state={isLoading ? "loading" : isDisabled ? "disabled" : "idle"}
        className={[
          "rounded-button transition-smooth inline-flex items-center justify-center font-medium",
          "focus:ring-primary focus:ring-offset-surface focus:ring-2 focus:ring-offset-2 focus:outline-none",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {isLoading ? (
          <Spinner size={size === "sm" ? "sm" : "md"} className="text-current" />
        ) : (
          children
        )}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
