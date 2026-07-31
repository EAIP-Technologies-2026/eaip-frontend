"use client";

import { useState, useEffect } from "react";
import { DATA_ATTRIBUTE_MOTION } from "./types";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setReduced(e.matches);
      document.documentElement.setAttribute(
        DATA_ATTRIBUTE_MOTION,
        e.matches.toString(),
      );
    };
    mq.addEventListener("change", handler);
    return () => { mq.removeEventListener("change", handler); };
  }, []);

  return reduced;
}
