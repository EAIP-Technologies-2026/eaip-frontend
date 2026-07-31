import { forwardRef, type ElementType, type LabelHTMLAttributes, type ReactNode } from "react";

export type LabelSize = "sm" | "md" | "lg";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  as?: ElementType;
  size?: LabelSize;
  required?: boolean;
  children: ReactNode;
}

const sizeMap: Record<LabelSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      as: Tag = "label",
      size = "md",
      required = false,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const classes = [
      "font-medium text-text-secondary",
      sizeMap[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Tag ref={ref} className={classes} {...props}>
        {children}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </Tag>
    );
  },
);

Label.displayName = "Label";
