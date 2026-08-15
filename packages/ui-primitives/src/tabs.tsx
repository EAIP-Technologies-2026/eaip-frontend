"use client";

import type { ReactNode, HTMLAttributes, ButtonHTMLAttributes } from "react";
import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useReducedMotion, durationTokens, easingTokens } from "@eaip/motion";

export type TabsOrientation = "horizontal" | "vertical";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation: TabsOrientation;
  registerTab: (value: string) => void;
  unregisterTab: (value: string) => void;
  tabValues: string[];
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
  const [tabValues, setTabValues] = useState<string[]>([]);
  const value = controlledValue ?? internalValue;

  function handleValueChange(val: string) {
    if (onValueChange) onValueChange(val);
    else setInternalValue(val);
  }

  const registerTab = useCallback((val: string) => {
    setTabValues((prev) => {
      if (prev.includes(val)) return prev;
      return [...prev, val];
    });
  }, []);

  const unregisterTab = useCallback((val: string) => {
    setTabValues((prev) => prev.filter((v) => v !== val));
  }, []);

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange, orientation, registerTab, unregisterTab, tabValues }}>
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
  const { value: activeValue, onValueChange, orientation, registerTab, unregisterTab, tabValues } = useTabsContext();
  const isSelected = activeValue === value;
  const prefersReducedMotion = useReducedMotion();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Register/unregister tab value
  useEffect(() => {
    registerTab(value);
    return () => { unregisterTab(value); };
  }, [value, registerTab, unregisterTab]);

  const motionStyle = prefersReducedMotion
    ? { transitionDuration: "0.01ms" }
    : {
        transitionProperty: "color, border-color, background-color",
        transitionDuration: durationTokens.fast,
        transitionTimingFunction: easingTokens.snappy,
      };

  function handleKeyDown(e: React.KeyboardEvent) {
    const isHorizontal = orientation === "horizontal";
    const currentIndex = tabValues.indexOf(value);
    let nextIndex = currentIndex;

    if (isHorizontal) {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabValues.length;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabValues.length) % tabValues.length;
      }
    } else {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabValues.length;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabValues.length) % tabValues.length;
      }
    }

    if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabValues.length - 1;
    }

    if (nextIndex !== currentIndex) {
      const nextValue = tabValues[nextIndex];
      if (nextValue) {
        onValueChange(nextValue);
        // Focus the next tab button
        const parent = buttonRef.current?.closest('[role="tablist"]');
        if (parent) {
          const tabs = parent.querySelectorAll('[role="tab"]');
          const nextTab = tabs.item(nextIndex);
          if (nextTab instanceof HTMLElement) nextTab.focus();
        }
      }
    }
  }

  return (
    <button
      ref={buttonRef}
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
      onKeyDown={handleKeyDown}
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
