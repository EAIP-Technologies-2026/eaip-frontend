"use client";

import { useTheme } from "@eaip/theme";

export function ThemeSwitcher() {
  const { mode, resolved, setMode } = useTheme();

  const options: { value: "light" | "dark" | "system" }[] = [
    { value: "light" },
    { value: "dark" },
    { value: "system" },
  ];

  return (
    <div
      className="flex items-center gap-1 rounded-button border border-border bg-surface p-1"
      role="radiogroup"
      aria-label="Theme"
    >
      {options.map((option) => {
        const active = mode === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              setMode(option.value);
            }}
            className={[
              "rounded-button px-2 py-1 text-xs font-medium capitalize transition-smooth",
              active ? "bg-primary-subtle text-primary" : "text-text-secondary hover:bg-surface-tertiary hover:text-text",
            ].join(" ")}
            title={option.value === "system" ? `System (${resolved})` : option.value}
          >
            {option.value}
            {active && option.value === "system" ? ` (${resolved})` : ""}
          </button>
        );
      })}
    </div>
  );
}
