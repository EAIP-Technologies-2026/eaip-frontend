import type { HTMLAttributes } from "react";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  label?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantColors: Record<string, string> = {
  default: "bg-blue-600",
  success: "bg-green-600",
  warning: "bg-yellow-500",
  danger: "bg-red-600",
};

export function ProgressBar({
  value,
  max,
  label,
  variant = "default",
  className,
  ...props
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={["flex items-center gap-3", className].filter(Boolean).join(" ")} {...props}>
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <div
        className="flex-1 rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={[
            "h-2 rounded-full transition-all",
            variantColors[variant] ?? variantColors.default,
          ]}
          style={{ width: `${String(pct)}%` }}
        />
      </div>
      <span className="text-sm text-gray-500">{Math.round(pct)}%</span>
    </div>
  );
}
