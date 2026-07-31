import type { InputHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { cn } from "@eaip/core";

export interface RadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface RadioGroupContextValue {
  name?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  name?: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  orientation?: "vertical" | "horizontal";
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
  options?: RadioOption[];
}

export function RadioGroup({
  name,
  value,
  onChange,
  disabled = false,
  orientation = "vertical",
  size = "md",
  children,
  options,
  className,
  ...props
}: RadioGroupProps) {
  const ctx: RadioGroupContextValue = { name, value, onChange, disabled, orientation, size };
  return (
    <RadioGroupContext.Provider value={ctx}>
      <div
        className={cn(
          "flex",
          orientation === "vertical" ? "flex-col gap-2" : "flex-row flex-wrap gap-4",
          className,
        )}
        role="radiogroup"
        {...props}
      >
        {options
          ? options.map((opt) => (
              <RadioItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </RadioItem>
            ))
          : children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  children?: ReactNode;
}

export function RadioItem({ children, className, ...props }: RadioProps) {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error("RadioItem must be used within a RadioGroup");

  const sizeMap = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const dotSizeMap = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  const isChecked = props.value !== undefined && props.value === ctx.value;
  const isDisabled = props.disabled ?? ctx.disabled;

  return (
    <label className={cn("inline-flex items-center gap-2", isDisabled && "opacity-50 cursor-not-allowed", className)}>
      <span className="relative flex items-center justify-center">
        <input
          type="radio"
          name={ctx.name}
          value={props.value}
          checked={isChecked}
          onChange={(e) => {
            if (e.target.checked && props.value !== undefined) {
              ctx.onChange(String(props.value));
            }
          }}
          disabled={isDisabled}
          className="peer sr-only"
        />
        <span
          className={cn(
            "block rounded-full border-2 border-border transition-smooth",
            "peer-checked:border-primary",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-surface",
            sizeMap[ctx.size ?? "md"],
          )}
        >
          <span
            className={cn(
              "block rounded-full bg-primary transition-smooth scale-0 peer-checked:scale-100",
              dotSizeMap[ctx.size ?? "md"],
            )}
          />
        </span>
      </span>
      {children && <span className="text-sm text-text">{children}</span>}
    </label>
  );
}

export { RadioItem as Radio };