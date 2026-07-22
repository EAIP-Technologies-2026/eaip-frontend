"use client";

import { useTheme } from "@eaip/theme";

export function ThemeSwitcher() {
  const { mode, resolved, setMode } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border p-1">
      {(["light", "dark", "system"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            setMode(value);
          }}
          className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${
            mode === value ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
          }`}
          aria-pressed={mode === value}
        >
          {value}
          {mode === value && value === "system" ? ` (${resolved})` : ""}
        </button>
      ))}
    </div>
  );
}
