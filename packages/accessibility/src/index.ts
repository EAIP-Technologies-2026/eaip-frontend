import { useRef, type RefObject } from "react";

export function useFocusTrap(_active: boolean): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  return ref;
}

export interface AriaProps {
  role?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-labelledby"?: string;
  "aria-hidden"?: boolean;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-pressed"?: boolean;
  "aria-selected"?: boolean;
  "aria-current"?: "page" | "step" | "location" | "date" | "time" | boolean;
  "aria-disabled"?: boolean;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  "aria-errormessage"?: string;
}

export function mergeAriaProps(...propsList: (AriaProps | undefined)[]): AriaProps {
  const result: AriaProps = {};
  for (const props of propsList) {
    if (!props) continue;
    Object.assign(result, props);
  }
  return result;
}
