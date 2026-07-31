import { forwardRef } from "react";
import type { ForwardedRef, HTMLAttributes } from "react";
import type { ContainerOwnProps } from "./types";
import { spacingToTailwind } from "./types";

const sizeMap: Record<string, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-[90rem]",
  full: "max-w-full",
};

export interface ContainerProps extends ContainerOwnProps, Omit<HTMLAttributes<HTMLElement>, "children"> {}

export const Container = forwardRef<HTMLElement, ContainerProps>(
  (
    {
      as: Tag = "div",
      size = "lg",
      padding = "md",
      className,
      children,
      ...props
    },
    ref: ForwardedRef<HTMLElement>,
  ) => {
    const classes = [
      "mx-auto w-full",
      sizeMap[size],
      spacingToTailwind(padding, "px"),
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

Container.displayName = "Container";
