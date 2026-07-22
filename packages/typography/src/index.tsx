import type { ReactNode, ElementType, HTMLAttributes } from "react";

type Variant = "h1" | "h2" | "h3" | "h4" | "body" | "small" | "code";

const variantMap: Record<Variant, { tag: ElementType; className: string }> = {
  h1: { tag: "h1", className: "text-4xl font-bold leading-tight" },
  h2: { tag: "h2", className: "text-3xl font-semibold leading-tight" },
  h3: { tag: "h3", className: "text-2xl font-semibold leading-normal" },
  h4: { tag: "h4", className: "text-xl font-medium leading-normal" },
  body: { tag: "p", className: "text-base leading-relaxed" },
  small: { tag: "small", className: "text-sm leading-normal" },
  code: { tag: "code", className: "font-mono text-sm" },
};

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Typography({ variant = "body", children, className, ...props }: TypographyProps) {
  const { tag: Tag, className: baseClass } = variantMap[variant];
  return (
    <Tag className={[baseClass, className].filter(Boolean).join(" ")} {...props}>
      {children}
    </Tag>
  );
}
