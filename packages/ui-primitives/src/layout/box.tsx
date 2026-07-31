import { forwardRef } from "react";
import type { ForwardedRef, HTMLAttributes } from "react";
import type { BoxOwnProps, SpacingProp } from "./types";
import { spacingToTailwind } from "./types";

export interface BoxProps extends BoxOwnProps, Omit<HTMLAttributes<HTMLElement>, "children"> {}

function toP(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "p"); }
function toPx(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "px"); }
function toPy(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "py"); }
function toM(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "m"); }
function toMx(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "mx"); }
function toMy(value: SpacingProp | undefined): string | undefined { return spacingToTailwind(value, "my"); }

export const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      as: Tag = "div",
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

Box.displayName = "Box";
