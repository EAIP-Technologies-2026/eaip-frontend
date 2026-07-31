import { forwardRef } from "react";
import type { ForwardedRef, HTMLAttributes } from "react";
import type { FlexOwnProps, SpacingProp } from "./types";
import { spacingToTailwind, gapToTailwind } from "./types";

const directionMap: Record<string, string> = {
  row: "flex-row",
  column: "flex-col",
  "row-reverse": "flex-row-reverse",
  "column-reverse": "flex-col-reverse",
};

const wrapMap: Record<string, string> = {
  nowrap: "flex-nowrap",
  wrap: "flex-wrap",
  "wrap-reverse": "flex-wrap-reverse",
};

const alignMap: Record<string, string> = {
  start: "items-start",
  end: "items-end",
  center: "items-center",
  baseline: "items-baseline",
  stretch: "items-stretch",
};

const justifyMap: Record<string, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

function toP(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "p"); }
function toPx(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "px"); }
function toPy(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "py"); }
function toM(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "m"); }
function toMx(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "mx"); }
function toMy(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "my"); }

export interface FlexProps extends FlexOwnProps, Omit<HTMLAttributes<HTMLElement>, "children"> {}

export const Flex = forwardRef<HTMLElement, FlexProps>(
  (
    {
      as: Tag = "div",
      direction = "row",
      wrap,
      align,
      justify,
      gap,
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
      "flex",
      directionMap[direction],
      wrap && wrapMap[wrap],
      align && alignMap[align],
      justify && justifyMap[justify],
      gapToTailwind(gap),
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

Flex.displayName = "Flex";
