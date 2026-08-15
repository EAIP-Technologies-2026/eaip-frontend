"use client";

import type { ReactNode, HTMLAttributes } from "react";
import { EnterpriseIcon } from "@eaip/icons";
import { cn } from "@eaip/core";

export interface PageHeroProps extends HTMLAttributes<HTMLElement> {
  icon?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHero({
  icon,
  eyebrow,
  title,
  description,
  children,
  className = "",
  ...props
}: PageHeroProps) {
  return (
    <section className={cn("surface-hero relative overflow-hidden p-5 sm:p-7 lg:p-8", className)} {...props}>
      <div className="relative">
        {(eyebrow ?? icon) && (
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase">
            {icon && <EnterpriseIcon name={icon as never} size={14} />}
            {eyebrow}
          </div>
        )}
        <h1 className="text-balance text-xl font-bold tracking-tight text-text sm:text-2xl lg:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </section>
  );
}
