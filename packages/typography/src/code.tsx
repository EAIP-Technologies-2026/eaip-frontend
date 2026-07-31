import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";

export type CodeVariant = "inline" | "block";
export type CodeColor = "default" | "primary";

export interface CodeProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  variant?: CodeVariant;
  color?: CodeColor;
  children: ReactNode;
}

const variantMap: Record<CodeVariant, string> = {
  inline: "rounded px-1.5 py-0.5",
  block: "block rounded p-4 whitespace-pre overflow-x-auto",
};

const colorMap: Record<CodeColor, string> = {
  default: "bg-surface-tertiary text-text-secondary border border-border",
  primary: "bg-primary-subtle text-primary border border-primary/20",
};

export const Code = forwardRef<HTMLElement, CodeProps>(
  (
    {
      as: Tag = "code",
      variant = "inline",
      color = "default",
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const classes = [
      "font-mono text-sm",
      variantMap[variant],
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

Code.displayName = "Code";
