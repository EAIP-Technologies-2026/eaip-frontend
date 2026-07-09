import { useCallback, useRef, type RefObject } from "react";

export function useFocusTrap(active: boolean): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!active || !ref.current) return;
      if (event.key !== "Tab") return;

      const focusable = ref.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    [active],
  );

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

export function mergeAriaProps(...propsList: Array<AriaProps | undefined>): AriaProps {
  const result: AriaProps = {};
  for (const props of propsList) {
    if (!props) continue;
    Object.assign(result, props);
  }
  return result;
}
