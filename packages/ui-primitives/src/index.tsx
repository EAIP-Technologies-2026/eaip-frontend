export { Button } from "./button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./button";

export { IconButton } from "./icon-button";
export type { IconButtonProps, IconButtonVariant, IconButtonSize } from "./icon-button";

export { Divider } from "./divider";
export type { DividerProps, DividerOrientation, DividerVariant } from "./divider";

export { calculatePosition } from "./popover-engine";
export type {
  PositionOptions,
  CalculatedPosition,
  PositioningSide,
  PositioningAlign,
} from "./popover-engine";

export { Tabs, TabsRoot, TabsList, TabsTrigger, TabsContent } from "./tabs";
export type {
  TabsRootProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  TabsOrientation,
} from "./tabs";

export { Tooltip, TooltipRoot, TooltipTrigger, TooltipContent } from "./tooltip";
export type { TooltipRootProps, TooltipTriggerProps, TooltipContentProps } from "./tooltip";

export { Popover, PopoverRoot, PopoverTrigger, PopoverContent } from "./popover";
export type { PopoverRootProps, PopoverTriggerProps, PopoverContentProps } from "./popover";

export { Skeleton, EmptyState, LoadingState, ErrorState } from "./states";
export type { SkeletonProps, EmptyStateProps, LoadingStateProps, ErrorStateProps } from "./states";

export { LinearProgress, CircularProgress, LinearProgress as ProgressBar } from "./progress";
export type {
  LinearProgressProps,
  CircularProgressProps,
  LinearProgressProps as ProgressBarProps,
} from "./progress";

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
import { forwardRef, useState } from "react";
import { EnterpriseIcon } from "@eaip/icons";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconLeft?: string;
  iconRight?: string;
  type?: string;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      className,
      id,
      iconLeft,
      iconRight,
      type = "text",
      value,
      onChange,
      onClear,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const isPassword = type === "password";
    const isSearch = type === "search";
    const currentType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5" data-slot="input-container">
        {label && (
          <label htmlFor={inputId} className="text-text-secondary text-sm font-medium">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {(iconLeft ?? isSearch) ? (
            <span className="text-text-muted pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
              <EnterpriseIcon
                name={(iconLeft ?? (isSearch ? "search" : "circle")) as never}
                size={18}
              />
            </span>
          ) : null}
          <input
            id={inputId}
            ref={ref}
            type={currentType}
            value={value}
            onChange={onChange}
            data-slot="input"
            data-type={type}
            data-state={error ? "error" : "idle"}
            className={[
              "rounded-input bg-surface text-text transition-smooth block w-full border px-3 py-2.5 text-sm shadow-[inset_0_1px_2px_rgba(17,24,39,0.03)]",
              "border-border placeholder:text-text-muted",
              "focus:border-primary focus:ring-primary focus:ring-offset-surface focus:ring-2 focus:ring-offset-2 focus:outline-none",
              error && "border-danger focus:border-danger focus:ring-danger",
              (iconLeft ?? isSearch) && "pl-10",
              (iconRight ?? (isPassword || Boolean(isSearch && value))) && "pr-10",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${String(inputId)}-error` : undefined}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => {
                setShowPassword((prev) => !prev);
              }}
              className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EnterpriseIcon name={(showPassword ? "eyeOff" : "eye") as never} size={18} />
            </button>
          ) : isSearch && value && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="text-text-muted hover:text-text absolute top-1/2 right-3 -translate-y-1/2 focus:outline-none"
              aria-label="Clear search input"
            >
              <EnterpriseIcon name="x" size={16} />
            </button>
          ) : iconRight ? (
            <span className="text-text-muted pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
              <EnterpriseIcon name={iconRight as never} size={18} />
            </span>
          ) : null}
        </div>
        {error && (
          <p id={`${String(inputId)}-error`} className="text-danger text-sm" role="alert">
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
      <div className="flex flex-col gap-1.5" data-slot="textarea-container">
        {label && (
          <label htmlFor={inputId} className="text-text-secondary text-sm font-medium">
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          ref={ref}
          data-slot="textarea"
          data-state={error ? "error" : "idle"}
          className={[
            "rounded-input bg-surface text-text transition-smooth block w-full border px-3 py-2.5 text-sm shadow-sm",
            "border-border focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none",
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
          <p id={`${String(inputId)}-error`} className="text-danger text-sm" role="alert">
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
      <div className="flex flex-col gap-1.5" data-slot="select-container">
        {label && (
          <label htmlFor={inputId} className="text-text-secondary text-sm font-medium">
            {label}
          </label>
        )}
        <select
          id={inputId}
          ref={ref}
          data-slot="select"
          data-state={error ? "error" : "idle"}
          className={[
            "rounded-input bg-surface text-text transition-smooth block w-full border px-3 py-2.5 text-sm shadow-sm",
            "border-border focus:border-primary focus:ring-primary focus:ring-1 focus:outline-none",
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
          <p id={`${String(inputId)}-error`} className="text-danger text-sm" role="alert">
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

export function Badge({ variant = "default", children, className = "", ...props }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    default:
      "bg-surface-tertiary text-text-secondary border border-border hover:bg-surface-secondary",
    primary: "bg-primary-subtle text-primary border border-primary/20 hover:bg-primary-subtle/80",
    success: "bg-success-subtle text-success border border-success/20 hover:bg-success-subtle/80",
    warning: "bg-warning-subtle text-warning border border-warning/20 hover:bg-warning-subtle/80",
    danger: "bg-danger-subtle text-danger border border-danger/20 hover:bg-danger-subtle/80",
    glass: "glass text-text hover:bg-surface-secondary/80",
  };
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={[
        "transition-smooth inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
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
  ({ label, labelClassName = "", className = "", ...props }, ref) => {
    return (
      <label
        data-slot="switch"
        className={["inline-flex cursor-pointer items-center gap-3", className]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="bg-text-muted transition-smooth has-[:checked]:bg-primary relative inline-flex h-6 w-11 items-center rounded-full">
          <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
          <span className="bg-surface absolute left-1 h-4 w-4 rounded-full transition-transform peer-checked:translate-x-5" />
        </span>
        {label && (
          <span
            className={["text-text-secondary text-sm", labelClassName].filter(Boolean).join(" ")}
          >
            {label}
          </span>
        )}
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
  ({ label, labelClassName = "", className = "", ...props }, ref) => {
    return (
      <label
        data-slot="checkbox"
        className={["inline-flex cursor-pointer items-center gap-2", className]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          ref={ref}
          type="checkbox"
          className="border-border bg-surface text-primary transition-smooth focus:ring-primary focus:ring-offset-surface h-4 w-4 rounded focus:ring-2 focus:ring-offset-2"
          {...props}
        />
        {label && (
          <span
            className={["text-text-secondary text-sm", labelClassName].filter(Boolean).join(" ")}
          >
            {label}
          </span>
        )}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  fallbackClassName?: string;
}

export function Avatar({
  src,
  name,
  size = "md",
  className = "",
  fallbackClassName = "",
  ...props
}: AvatarProps) {
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
      data-slot="avatar"
      data-size={size}
      className={[
        "bg-primary-subtle text-primary ring-surface inline-flex items-center justify-center overflow-hidden rounded-full font-semibold ring-2",
        sizes[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={name}
      {...props}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className={fallbackClassName}>{initials}</span>
      )}
    </div>
  );
}

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export function Label({ children, required, className = "", ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={["text-text-secondary text-sm font-medium", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  );
}

export interface FormGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function FormGroup({ children, className = "", ...props }: FormGroupProps) {
  return (
    <div
      data-slot="form-group"
      className={["flex flex-col gap-5", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export interface SectionTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
}

export function SectionTitle({
  children,
  as: Component = "h2",
  className = "",
  ...props
}: SectionTitleProps) {
  return (
    <Component
      data-slot="section-title"
      className={["text-text text-lg font-semibold tracking-tight", className]
        .filter(Boolean)
        .join(" ")}
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
