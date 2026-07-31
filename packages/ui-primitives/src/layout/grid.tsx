import { forwardRef } from "react";
import type { ForwardedRef, HTMLAttributes } from "react";
import type { GridOwnProps, SpacingProp } from "./types";
import { spacingToTailwind, gapToTailwind } from "./types";

function toP(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "p"); }
function toPx(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "px"); }
function toPy(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "py"); }
function toM(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "m"); }
function toMx(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "mx"); }
function toMy(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "my"); }

function columnsClass(columns: number | "auto" | "none" | undefined): string | undefined {
  if (columns === undefined) return undefined;
  if (columns === "auto") return "grid-cols-auto-fit";
  if (columns === "none") return "grid-cols-none";
  if (columns >= 1 && columns <= 12) return `grid-cols-${String(columns)}`;
  return undefined;
}

function rowsClass(rows: number | "auto" | "none" | undefined): string | undefined {
  if (rows === undefined) return undefined;
  if (rows === "auto") return "grid-rows-auto";
  if (rows === "none") return "grid-rows-none";
  if (rows >= 1 && rows <= 6) return `grid-rows-${String(rows)}`;
  return undefined;
}

export interface GridProps extends GridOwnProps, Omit<HTMLAttributes<HTMLElement>, "children"> {}

export const Grid = forwardRef<HTMLElement, GridProps>(
  (
    {
      as: Tag = "div",
      columns,
      rows,
      gap,
      columnGap,
      rowGap,
      padding,
      paddingX,
      paddingY,
      margin,
      marginX,
      marginY,
      className,
      children,
      ...props
    },
    ref: ForwardedRef<HTMLElement>,
  ) => {
    const classes = [
      "grid",
      columnsClass(columns),
      rowsClass(rows),
      gapToTailwind(gap),
      columnGap !== undefined && gapToTailwind(columnGap, "gap-x"),
      rowGap !== undefined && gapToTailwind(rowGap, "gap-y"),
      toP(padding),
      toPx(paddingX),
      toPy(paddingY),
      toM(margin),
      toMx(marginX),
      toMy(marginY),
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

Grid.displayName = "Grid";
