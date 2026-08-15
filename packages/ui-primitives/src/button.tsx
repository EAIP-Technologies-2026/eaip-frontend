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
    "btn-liquid-glass btn-liquid-glass-primary font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50",
  secondary:
    "btn-liquid-glass font-medium text-text focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50",
  tertiary:
    "bg-surface-secondary/80 text-text-secondary border border-transparent hover:bg-surface-tertiary hover:text-text hover:border-border/60 active:scale-[0.98] active:bg-surface-tertiary focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200",
  ghost:
    "btn-liquid-glass btn-liquid-glass-ghost font-medium text-text-secondary focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50",
  destructive:
    "btn-liquid-glass btn-liquid-glass-danger font-semibold focus-visible:ring-2 focus-visible:ring-danger focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50",
  glass:
    "btn-liquid-glass font-medium text-text focus-visible:ring-2 focus-visible:ring-border-strong focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1.5 text-xs gap-1.5 rounded-lg",
  sm: "px-3.5 py-2 text-sm gap-1.5 rounded-lg",
  md: "px-4 py-2.5 text-sm gap-2 rounded-lg",
  lg: "px-5 py-3 text-base gap-2.5 rounded-lg",
  xl: "px-6 py-3.5 text-lg gap-3 rounded-lg",
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
      "inline-flex items-center justify-center",
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
        {loading && <span className="relative z-10"><Spinner size={iconSize} /></span>}
        {!loading && displayState === "success" && <span className="relative z-10"><SuccessIcon size={iconSize} /></span>}
        {!loading && displayState === "error" && <span className="relative z-10"><ErrorIcon size={iconSize} /></span>}
        {!loading && !displayState && iconLeft && (
          <span className="shrink-0 relative z-10">{iconLeft}</span>
        )}
        {!loading && !displayState && !iconOnly && (
          <span className="truncate relative z-10">{children}</span>
        )}
        {!loading && !displayState && iconRight && (
          <span className="shrink-0 relative z-10">{iconRight}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
