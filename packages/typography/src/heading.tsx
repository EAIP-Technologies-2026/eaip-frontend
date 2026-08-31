import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type HeadingWeight = "medium" | "semibold" | "bold";
export type HeadingColor = "default" | "secondary" | "muted" | "inverse" | "primary";

export type HeadingTracking = "display" | "tight" | "snug" | "normal" | "wide";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: ElementType;
  level?: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  color?: HeadingColor;
  tracking?: HeadingTracking;
  children: ReactNode;
}

const defaultSizeForLevel: Record<HeadingLevel, HeadingSize> = {
  1: "4xl",
  2: "3xl",
  3: "2xl",
  4: "xl",
  5: "lg",
  6: "md",
};

const defaultWeightForLevel: Record<HeadingLevel, HeadingWeight> = {
  1: "bold",
  2: "semibold",
  3: "semibold",
  4: "medium",
  5: "medium",
  6: "medium",
};

const sizeMap: Record<HeadingSize, string> = {
  xs: "text-xs leading-normal",
  sm: "text-sm leading-snug",
  md: "text-base leading-snug",
  lg: "text-lg leading-snug",
  xl: "text-xl leading-snug",
  "2xl": "text-2xl leading-tight",
  "3xl": "text-3xl leading-tight",
  "4xl": "text-4xl leading-tight sm:text-5xl",
};

const trackingForSize: Record<HeadingSize, string> = {
  xs: "tracking-normal",
  sm: "tracking-normal",
  md: "tracking-snug-enterprise",
  lg: "tracking-snug-enterprise",
  xl: "tracking-tight-enterprise",
  "2xl": "tracking-tight-enterprise",
  "3xl": "tracking-display",
  "4xl": "tracking-display",
};

const trackingMap: Record<HeadingTracking, string> = {
  display: "tracking-display",
  tight: "tracking-tight-enterprise",
  snug: "tracking-snug-enterprise",
  normal: "tracking-normal",
  wide: "tracking-wide",
};

const weightMap: Record<HeadingWeight, string> = {
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorMap: Record<HeadingColor, string> = {
  default: "text-text",
  secondary: "text-text-secondary",
  muted: "text-text-muted",
  inverse: "text-text-inverse",
  primary: "text-primary",
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    { level = 1, size, weight, color = "default", tracking, as, children, className, ...props },
    ref,
  ) => {
    const Tag = as ?? (`h${String(level)}` as ElementType);
    const resolvedSize = size ?? defaultSizeForLevel[level];
    const resolvedWeight = weight ?? defaultWeightForLevel[level];
    const resolvedTracking = tracking ? trackingMap[tracking] : trackingForSize[resolvedSize];

    const classes = [
      "text-balance",
      resolvedTracking,
      sizeMap[resolvedSize],
      weightMap[resolvedWeight],
      colorMap[color],
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

Heading.displayName = "Heading";
