import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

export type LinkVariant = "default" | "subtle" | "muted";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  underline?: boolean;
  children: ReactNode;
}

const variantMap: Record<LinkVariant, string> = {
  default: "text-primary hover:text-primary-hover",
  subtle: "text-text-secondary hover:text-text",
  muted: "text-text-muted hover:text-text-secondary",
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      variant = "default",
      underline = false,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const classes = [
      "transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
      variantMap[variant],
      underline && "underline underline-offset-2",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <a ref={ref} className={classes} {...props}>
        {children}
      </a>
    );
  },
);

Link.displayName = "Link";
