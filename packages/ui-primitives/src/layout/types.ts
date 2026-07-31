import type { ElementType, ReactNode } from "react";

export type SpacingScale =
  | 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 | 3.5
  | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  | 14 | 16 | 20 | 24 | 28 | 32 | 36 | 40
  | 44 | 48 | 52 | 56 | 60 | 64 | 72 | 80 | 96;

export type SemanticSpacing = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export const spacingMap: Record<SemanticSpacing, string> = {
  none: "0",
  xs: "1",
  sm: "2",
  md: "4",
  lg: "6",
  xl: "8",
  "2xl": "12",
  "3xl": "16",
};

export type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

export type SpacingProp = SemanticSpacing | SpacingScale;

function isSemantic(value: string): value is SemanticSpacing {
  return value in spacingMap;
}

export function spacingToTailwind(value: SpacingProp | undefined, prefix: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && isSemantic(value)) {
    return `${prefix}-${spacingMap[value]}`;
  }
  return `${prefix}-${String(value)}`;
}

export function gapToTailwind(value: SpacingProp | undefined, prefix: "gap" | "gap-x" | "gap-y" = "gap"): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && isSemantic(value)) {
    return `${prefix}-${spacingMap[value]}`;
  }
  return `${prefix}-${String(value)}`;
}

export interface BoxOwnProps {
  as?: ElementType;
  padding?: SpacingProp;
  paddingX?: SpacingProp;
  paddingY?: SpacingProp;
  margin?: SpacingProp;
  marginX?: SpacingProp;
  marginY?: SpacingProp;
  children?: ReactNode;
}

export interface FlexOwnProps extends BoxOwnProps {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  align?: "start" | "end" | "center" | "baseline" | "stretch";
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly";
  gap?: SpacingProp;
}

export interface StackOwnProps extends BoxOwnProps {
  gap?: SpacingProp;
  dividers?: boolean;
}

export interface GridOwnProps extends BoxOwnProps {
  columns?: number | "auto" | "none";
  rows?: number | "auto" | "none";
  gap?: SpacingProp;
  columnGap?: SpacingProp;
  rowGap?: SpacingProp;
}

export interface ContainerOwnProps {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: SpacingProp;
  children?: ReactNode;
  as?: ElementType;
  className?: string;
}
