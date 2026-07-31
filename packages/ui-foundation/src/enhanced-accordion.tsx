import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";

export type AccordionSize = "sm" | "md" | "lg";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  items: AccordionItem[];
  allowMultiple?: boolean;
  size?: AccordionSize;
}

const sizeStyles: Record<AccordionSize, { summary: string; content: string }> = {
  sm: { summary: "px-3 py-2 text-xs", content: "px-3 pb-2 text-xs" },
  md: { summary: "px-5 py-4 text-sm", content: "px-5 pb-4 text-sm" },
  lg: { summary: "px-6 py-5 text-base", content: "px-6 pb-5 text-base" },
};

export function Accordion({
  items,
  allowMultiple = false,
  size = "md",
  className,
  ...props
}: AccordionProps) {
  return (
    <div
      className={cn(
        "divide-y divide-border rounded-card border border-border bg-surface",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <details
          key={item.id}
          className="group"
          onToggle={(e) => {
            if (!allowMultiple && (e.target as HTMLDetailsElement).open) {
              document
                .querySelectorAll("details[open]")
                .forEach((detail) => {
                  if (detail !== e.target) detail.removeAttribute("open");
                });
            }
          }}
        >
          <summary
            className={cn(
              "flex cursor-pointer list-none items-center justify-between font-medium text-text transition-smooth hover:bg-surface-secondary",
              sizeStyles[size].summary,
            )}
          >
            {item.title}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="transition-transform group-open:rotate-180 shrink-0"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className={cn("text-text-secondary", sizeStyles[size].content)}>
            {item.content}
          </div>
        </details>
      ))}
    </div>
  );
}