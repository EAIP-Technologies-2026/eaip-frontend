import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@eaip/core";

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  orientation?: "vertical" | "horizontal";
}

export function FormField({
  children,
  label,
  htmlFor,
  required = false,
  error,
  helpText,
  orientation = "vertical",
  className,
  ...props
}: FormFieldProps) {
  const id = htmlFor;
  const errorId = id ? `${id}-error` : undefined;
  const helpId = id ? `${id}-help` : undefined;
  return (
    <div
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col gap-1.5" : "flex-row items-start gap-4",
        className,
      )}
      {...props}
    >
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium text-text-secondary",
            orientation === "horizontal" && "pt-2 min-w-[120px]",
          )}
        >
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </label>
      )}
      <div className="flex-1 flex flex-col gap-1">
        {children}
        {helpText && !error && (
          <p id={helpId} className="text-xs text-text-muted">{helpText}</p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-danger" role="alert">{error}</p>
        )}
      </div>
    </div>
  );
}