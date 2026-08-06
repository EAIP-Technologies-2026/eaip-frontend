"use client";

import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from "react";
import { createContext, useContext, useState } from "react";
import { useReducedMotion, durationTokens, easingTokens } from "@eaip/motion";

export type TabsOrientation = "horizontal" | "vertical";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation: TabsOrientation;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("Tabs compound components must be rendered inside <Tabs>");
  }
  return ctx;
}

export interface TabsRootProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  children: ReactNode;
}

export function TabsRoot({
  defaultValue,
  value: controlledValue,
  onValueChange,
  orientation = "horizontal",
  children,
  className = "",
  ...props
}: TabsRootProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const value = controlledValue ?? internalValue;

  function handleValueChange(val: string) {
    if (onValueChange) onValueChange(val);
    else setInternalValue(val);
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange, orientation }}>
      <div
        data-slot="tabs"
        data-orientation={orientation}
        className={`flex ${orientation === "vertical" ? "flex-row gap-4" : "flex-col gap-2"} ${className}`}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  "aria-label"?: string;
}

export function TabsList({
  children,
  "aria-label": ariaLabel = "Tabs",
  className = "",
  ...props
}: TabsListProps) {
  const { orientation } = useTabsContext();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      data-slot="tabs-list"
      data-orientation={orientation}
      className={`inline-flex ${
        orientation === "vertical"
          ? "border-border flex-col border-r pr-2"
          : "border-border flex-row border-b"
      } gap-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

export function TabsTrigger({
  value,
  children,
  disabled,
  className = "",
  ...props
}: TabsTriggerProps) {
  const { value: activeValue, onValueChange, orientation } = useTabsContext();
  const isSelected = activeValue === value;
  const prefersReducedMotion = useReducedMotion();

  const motionStyle = prefersReducedMotion
    ? { transitionDuration: "0.01ms" }
    : {
        transitionProperty: "color, border-color, background-color",
        transitionDuration: durationTokens.fast,
        transitionTimingFunction: easingTokens.snappy,
      };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      id={`tab-${value}`}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => {
        if (!disabled) onValueChange(value);
      }}
      data-slot="tabs-trigger"
      data-state={isSelected ? "active" : "inactive"}
      style={motionStyle}
      className={[
        "transition-smooth focus:ring-primary relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium focus:ring-2 focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        orientation === "horizontal"
          ? `-mb-px border-b-2 ${isSelected ? "border-primary text-primary font-semibold" : "text-text-secondary hover:text-text border-transparent"}`
          : `-mr-px border-r-2 ${isSelected ? "border-primary text-primary font-semibold" : "text-text-secondary hover:text-text border-transparent"}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children: ReactNode;
}

export function TabsContent({ value, children, className = "", ...props }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();
  const isSelected = activeValue === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      tabIndex={0}
      data-slot="tabs-content"
      data-state="active"
      className={`focus:ring-primary rounded-button p-2 focus:ring-2 focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});
