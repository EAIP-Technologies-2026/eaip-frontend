"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type DividerOrientation = "horizontal" | "vertical";
export type DividerVariant = "solid" | "dashed" | "dotted";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  variant?: DividerVariant;
  label?: ReactNode;
  labelPosition?: "start" | "center" | "end";
  decorative?: boolean;
}

export function Divider({
  orientation = "horizontal",
  variant = "solid",
  label,
  labelPosition = "center",
  decorative = true,
  className = "",
  ...props
}: DividerProps) {
  const borderVariantStyle =
    variant === "dashed"
      ? "border-dashed"
      : variant === "dotted"
        ? "border-dotted"
        : "border-solid";

  if (orientation === "vertical") {
    return (
      <div
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : "vertical"}
        data-slot="divider"
        data-variant={variant}
        data-orientation="vertical"
        className={[
          "border-border/60 inline-block h-full min-h-[1em] w-[1px] self-stretch border-r",
          borderVariantStyle,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }

  if (label) {
    const justifyStyle =
      labelPosition === "start"
        ? "justify-start"
        : labelPosition === "end"
          ? "justify-end"
          : "justify-center";

    return (
      <div
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : "horizontal"}
        data-slot="divider"
        data-variant={variant}
        data-orientation="horizontal"
        className={`flex w-full items-center ${justifyStyle} gap-3 ${className}`}
        {...props}
      >
        <span className={`border-border/60 flex-1 border-b ${borderVariantStyle}`} />
        <span className="text-text-muted text-xs font-medium">{label}</span>
        <span className={`border-border/60 flex-1 border-b ${borderVariantStyle}`} />
      </div>
    );
  }

  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : "horizontal"}
      data-slot="divider"
      data-variant={variant}
      data-orientation="horizontal"
      className={["border-border/60 w-full border-b", borderVariantStyle, className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
