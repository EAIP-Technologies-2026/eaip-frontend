import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[contenteditable=true]",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
  );
}

/**
 * Keeps keyboard focus inside an active dialog or popover and restores the
 * invoking element when it closes. The returned ref belongs on the dialog's
 * focusable content container.
 */
export function useFocusTrap(active: boolean): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFirst = () => {
      const [first] = focusableElements(container);
      (first ?? container).focus();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusable = focusableElements(container);
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);
    // Let dialog content mount before moving focus, without stealing it from a
    // consumer that synchronously focuses a specific field.
    const frame = requestAnimationFrame(() => {
      if (!container.contains(document.activeElement)) focusFirst();
    });

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("keydown", onKeyDown);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [active]);

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
