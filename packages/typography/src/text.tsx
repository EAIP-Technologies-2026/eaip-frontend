import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextColor =
  "default" | "secondary" | "muted" | "inverse" | "primary" | "success" | "warning" | "danger";
export type TextAlign = "left" | "center" | "right" | "justify";

export type TextTracking = "tight" | "snug" | "normal" | "wide" | "metadata";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  align?: TextAlign;
  tracking?: TextTracking;
  tabular?: boolean;
  relaxed?: boolean;
  balance?: boolean;
  pretty?: boolean;
  truncate?: boolean;
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  children: ReactNode;
}

const sizeMap: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};

const weightMap: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorMap: Record<TextColor, string> = {
  default: "text-text",
  secondary: "text-text-secondary",
  muted: "text-text-muted",
  inverse: "text-text-inverse",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const alignMap: Record<TextAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
};

const trackingMap: Record<TextTracking, string> = {
  tight: "tracking-tight-enterprise",
  snug: "tracking-snug-enterprise",
  normal: "tracking-normal",
  wide: "tracking-wide",
  metadata: "tracking-metadata",
};

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Tag = "p",
      size = "md",
      weight = "normal",
      color = "default",
      align,
      tracking,
      tabular = false,
      relaxed = false,
      balance = false,
      pretty = false,
      truncate = false,
      lineClamp,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const classes = [
      sizeMap[size],
      weightMap[weight],
      colorMap[color],
      align && alignMap[align],
      tracking && trackingMap[tracking],
      tabular && "tabular-nums",
      relaxed && "leading-relaxed",
      balance && "text-balance",
      pretty && "text-pretty",
      truncate && "truncate",
      lineClamp && `line-clamp-${String(lineClamp)}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Tag ref={ref} className={classes} {...props}>
        {children}
      </Tag>
    );
  },
);

Text.displayName = "Text";
