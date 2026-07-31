export { Button } from "./button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./button";

export { Box, Flex, Stack, Grid, Container } from "./layout";
export type {
  BoxProps,
  FlexProps,
  StackProps,
  GridProps,
  ContainerProps,
  SpacingScale,
  SemanticSpacing,
  Breakpoint,
  ResponsiveValue,
} from "./layout";
export { spacingMap } from "./layout";

import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  HTMLAttributes,
  OptionHTMLAttributes,
  Ref,
} from "react";
import { forwardRef } from "react";
import { EnterpriseIcon } from "@eaip/icons";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconLeft?: string;
  iconRight?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, iconLeft, iconRight, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <EnterpriseIcon name={iconLeft as never} size={18} />
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={[
              "block w-full rounded-input border bg-surface px-3 py-2.5 text-sm text-text shadow-[inset_0_1px_2px_rgba(17,24,39,0.03)] transition-smooth",
              "border-border placeholder:text-text-muted",
              "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface",
              error && "border-danger focus:border-danger focus:ring-danger",
              iconLeft && "pl-10",
              iconRight && "pr-10",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${String(inputId)}-error` : undefined}
            {...props}
          />
          {iconRight && (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              <EnterpriseIcon name={iconRight as never} size={18} />
            </span>
          )}
        </div>
        {error && (
          <p id={`${String(inputId)}-error`} className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          className={[
            "block w-full rounded-input border bg-surface px-3 py-2.5 text-sm text-text shadow-sm transition-smooth",
            "border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
            "placeholder:text-text-muted",
            error && "border-danger focus:border-danger focus:ring-danger",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${String(inputId)}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${String(inputId)}-error`} className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export interface SelectOption extends OptionHTMLAttributes<HTMLOptionElement> {
  label: string;
  value: string | number;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          className={[
            "block w-full rounded-input border bg-surface px-3 py-2.5 text-sm text-text shadow-sm transition-smooth",
            "border-border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
            error && "border-danger focus:border-danger focus:ring-danger",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${String(inputId)}-error` : undefined}
          {...props}
        >
          {options.map((opt) => {
            const { value, label, ...rest } = opt;
            return (
              <option key={String(value)} value={value} {...rest}>
                {label}
              </option>
            );
          })}
        </select>
        {error && (
          <p id={`${String(inputId)}-error`} className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "glass";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = "default", children, className, ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default: "bg-surface-tertiary text-text-secondary border border-border hover:bg-surface-secondary",
    primary: "bg-primary-subtle text-primary border border-primary/20 hover:bg-primary-subtle/80",
    success: "bg-success-subtle text-success border border-success/20 hover:bg-success-subtle/80",
    warning: "bg-warning-subtle text-warning border border-warning/20 hover:bg-warning-subtle/80",
    danger: "bg-danger-subtle text-danger border border-danger/20 hover:bg-danger-subtle/80",
    glass: "glass text-text hover:bg-surface-secondary/80",
  };
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-smooth",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
}

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  labelClassName?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, labelClassName, className, ...props }, ref) => {
    return (
      <label className={["inline-flex items-center gap-3 cursor-pointer", className].filter(Boolean).join(" ")}>
        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-text-muted transition-smooth has-[:checked]:bg-primary">
          <input
            ref={ref}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <span className="absolute left-1 h-4 w-4 rounded-full bg-surface transition-transform peer-checked:translate-x-5" />
        </span>
        {label && <span className={["text-sm text-text-secondary", labelClassName].filter(Boolean).join(" ")}>{label}</span>}
      </label>
    );
  },
);
Switch.displayName = "Switch";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  labelClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, labelClassName, className, ...props }, ref) => {
    return (
      <label className={["inline-flex items-center gap-2 cursor-pointer", className].filter(Boolean).join(" ")}>
        <input
          ref={ref}
          type="checkbox"
          className="h-4 w-4 rounded border-border bg-surface text-primary transition-smooth focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          {...props}
        />
        {label && <span className={["text-sm text-text-secondary", labelClassName].filter(Boolean).join(" ")}>{label}</span>}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  circle?: boolean;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ circle, width, height, className, ...props }: SkeletonProps) {
  const style = {
    width: width,
    height: height,
  };
  return (
    <div
      className={[
        "animate-pulse rounded bg-surface-tertiary",
        circle && "rounded-full",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  fallbackClassName?: string;
}

export function Avatar({ src, name, size = "md", className, fallbackClassName, ...props }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };
  return (
    <div
      className={[
        "inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-subtle text-primary font-semibold ring-2 ring-surface",
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={name}
      {...props}
    >
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <span className={fallbackClassName}>{initials}</span>}
    </div>
  );
}

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export function Label({ children, required, className, ...props }: LabelProps) {
  return (
    <label className={["text-sm font-medium text-text-secondary", className].filter(Boolean).join(" ")} {...props}>
      {children}
      {required && <span className="ml-0.5 text-danger">*</span>}
    </label>
  );
}

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function FormGroup({ children, className, ...props }: FormGroupProps) {
  return (
    <div className={["flex flex-col gap-5", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  label,
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: "h-1.5", md: "h-2.5" };
  const variants = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };
  return (
    <div className={["w-full", className].filter(Boolean).join(" ")} {...props}>
      <div
        className={[
          "w-full overflow-hidden rounded-full bg-surface-tertiary",
          heights[size],
        ].join(" ")}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div
          className={["h-full transition-all duration-300 ease-out", variants[variant]].join(" ")}
          style={{ width: `${String(percentage)}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-right text-xs text-text-secondary">{`${String(Math.round(percentage))}%`}</p>
      )}
    </div>
  );
}

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={[
        "page-enter flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface p-10 text-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-tertiary text-text-muted">
          <EnterpriseIcon name={icon as never} size={24} />
        </div>
      )}
      <h3 className="text-base font-semibold text-text">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
}

export function SectionTitle({ children, as: Component = "h2", className, ...props }: SectionTitleProps) {
  return (
    <Component
      className={["text-lg font-semibold tracking-tight text-text", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}

export { FormField } from "./form-field";
export type { FormFieldProps } from "./form-field";

export { InputGroup } from "./input-group";
export type { InputGroupProps } from "./input-group";

export { SearchInput } from "./search-input";
export type { SearchInputProps } from "./search-input";

export { RadioGroup, RadioItem, Radio } from "./radio-group";
export type { RadioGroupProps, RadioProps, RadioOption } from "./radio-group";

export { ToggleGroup } from "./toggle-group";
export type { ToggleGroupProps, ToggleOption } from "./toggle-group";

export { Chip } from "./chip";
export type { ChipProps, ChipVariant, ChipSize } from "./chip";

export { Spinner } from "./spinner";
export type { SpinnerProps, SpinnerSize } from "./spinner";

export type { Ref };
