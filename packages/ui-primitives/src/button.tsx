import {
  forwardRef,
  useState,
  useEffect,
} from "react";
import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type NewVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "glass";
export type ButtonVariant = NewVariant | "danger";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  iconOnly?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<NewVariant, string> = {
  primary:
    "bg-primary text-text-inverse shadow-sm border border-primary/20 hover:shadow-md hover:-translate-y-[1px] hover:shadow-primary/10 active:translate-y-0 active:scale-[0.97] active:shadow-sm active:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200",
  secondary:
    "bg-surface text-text border border-border/80 shadow-sm hover:bg-surface-secondary hover:border-border hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] active:shadow-sm active:bg-surface-tertiary focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200",
  tertiary:
    "bg-surface-secondary/80 text-text-secondary border border-transparent hover:bg-surface-tertiary hover:text-text hover:border-border/60 active:translate-y-0 active:scale-[0.97] active:bg-surface-tertiary focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:bg-surface-tertiary/60 hover:text-text active:translate-y-0 active:scale-[0.97] active:bg-surface-tertiary focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200",
  destructive:
    "bg-danger text-text-inverse shadow-sm border border-danger/20 hover:shadow-md hover:-translate-y-[1px] hover:shadow-danger/10 active:translate-y-0 active:scale-[0.97] active:shadow-sm active:opacity-90 focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200",
  glass:
    "btn-glass text-text shadow-sm hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.97] active:shadow-sm active:bg-surface-tertiary/80 focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs gap-1.5 rounded-button",
  sm: "px-3.5 py-2 text-sm gap-1.5 rounded-button",
  md: "px-4 py-2.5 text-sm gap-2 rounded-button",
  lg: "px-5 py-3 text-base gap-2.5 rounded-button",
  xl: "px-6 py-3.5 text-lg gap-3 rounded-button",
};

const iconOnlySizeStyles: Record<ButtonSize, string> = {
  xs: "p-1.5",
  sm: "p-2",
  md: "p-2.5",
  lg: "p-3",
  xl: "p-3.5",
};

const iconSizes: Record<ButtonSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 20,
  xl: 22,
};

function Spinner({ size }: { size: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

function SuccessIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveVariant(variant: ButtonVariant): NewVariant {
  if (variant === "danger") return "destructive";
  return variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      success = false,
      error = false,
      iconLeft,
      iconRight,
      iconOnly = false,
      fullWidth = false,
      disabled,
      children,
      className,
      type = "button",
      ...props
    },
    ref,
  ) => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    useEffect(() => {
      if (success) {
        setShowSuccess(true);
        const timer = setTimeout(() => { setShowSuccess(false); }, 2000);
        return () => { clearTimeout(timer); };
      }
    }, [success]);

    useEffect(() => {
      if (error) {
        setShowError(true);
        const timer = setTimeout(() => { setShowError(false); }, 2000);
        return () => { clearTimeout(timer); };
      }
    }, [error]);

    const effectiveVariant = resolveVariant(variant);
    const isDisabled = disabled ?? loading;

    const base = [
      "inline-flex items-center justify-center font-medium",
      "focus:outline-none",
      "disabled:opacity-50 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none",
      "select-none",
      variantStyles[effectiveVariant],
      iconOnly ? iconOnlySizeStyles[size] : sizeStyles[size],
      fullWidth && "w-full",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const iconSize = iconSizes[size];
    const displayState = showSuccess ? "success" : showError ? "error" : null;

    return (
      <button
        ref={ref}
        type={type}
        className={base}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        aria-label={
          iconOnly && typeof children === "string"
            ? children
            : undefined
        }
        {...props}
      >
        {loading && <Spinner size={iconSize} />}
        {!loading && displayState === "success" && <SuccessIcon size={iconSize} />}
        {!loading && displayState === "error" && <ErrorIcon size={iconSize} />}
        {!loading && !displayState && iconLeft && (
          <span className="shrink-0">{iconLeft}</span>
        )}
        {!loading && !displayState && !iconOnly && (
          <span className="truncate">{children}</span>
        )}
        {!loading && !displayState && iconRight && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
