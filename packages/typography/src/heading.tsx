import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type HeadingWeight = "medium" | "semibold" | "bold";
export type HeadingColor = "default" | "secondary" | "muted" | "inverse" | "primary";

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: ElementType;
  level?: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  color?: HeadingColor;
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
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
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
    {
      level = 1,
      size,
      weight,
      color = "default",
      as,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const Tag = as ?? (`h${String(level)}` as ElementType);
    const resolvedSize = size ?? defaultSizeForLevel[level];
    const resolvedWeight = weight ?? defaultWeightForLevel[level];

    const classes = [
      "tracking-tight",
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
