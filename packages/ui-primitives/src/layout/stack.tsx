import { forwardRef } from "react";
import type { ForwardedRef, HTMLAttributes } from "react";
import type { StackOwnProps, SpacingProp } from "./types";
import { spacingToTailwind, gapToTailwind } from "./types";

function toP(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "p"); }
function toPx(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "px"); }
function toPy(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "py"); }
function toM(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "m"); }
function toMx(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "mx"); }
function toMy(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "my"); }

export interface StackProps extends StackOwnProps, Omit<HTMLAttributes<HTMLElement>, "children"> {}

export const Stack = forwardRef<HTMLElement, StackProps>(
  (
    {
      as: Tag = "div",
      gap = "md",
      dividers = false,
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
      "flex flex-col",
      gapToTailwind(gap),
      dividers && "divide-y divide-border",
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

Stack.displayName = "Stack";
