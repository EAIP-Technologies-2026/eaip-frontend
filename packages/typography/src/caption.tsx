import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";

export type CaptionColor = "default" | "secondary" | "muted";

export interface CaptionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  color?: CaptionColor;
  children: ReactNode;
}

const colorMap: Record<CaptionColor, string> = {
  default: "text-text-secondary",
  secondary: "text-text-muted",
  muted: "text-text-muted",
};

export const Caption = forwardRef<HTMLElement, CaptionProps>(
  (
    {
      as: Tag = "span",
      color = "default",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const classes = [
      "text-xs leading-normal",
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

Caption.displayName = "Caption";
