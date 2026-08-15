"use client";

import { useTheme } from "@eaip/theme";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { mode, setMode } = useTheme();

  const options: { value: "light" | "dark" | "vibe"; label: string; symbol: string }[] = [
    { value: "light", label: "Light", symbol: "L" },
    { value: "dark", label: "Dark", symbol: "D" },
    { value: "vibe", label: "Vibe", symbol: "V" },
  ];

  if (compact) {
    return (
      <div className="nav-theme-compact" role="radiogroup" aria-label="Theme">
        {options.map((option) => {
          const active = mode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${option.label} theme`}
              title={`${option.label} mode`}
              onClick={() => { setMode(option.value); }}
              className={active ? "nav-theme-compact__item nav-theme-compact__item--active" : "nav-theme-compact__item"}
            >
              {option.symbol}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div
        className="hidden items-center gap-1 rounded-button border border-border bg-surface p-1 sm:flex"
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
              title={`${option.label} mode`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-button border border-border bg-surface text-text-secondary transition-smooth hover:bg-surface-tertiary hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:hidden"
        onClick={() => {
          if (mode === "light") setMode("dark");
          else if (mode === "dark") setMode("vibe");
          else setMode("light");
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3v2M12 19v2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M3 12h2M19 12h2M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </button>
    </>
  );
}
