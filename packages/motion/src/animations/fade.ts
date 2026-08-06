import { durationTokens } from "../tokens/duration";
import { easingTokens } from "../tokens/easing";

export interface FadeOptions {
  duration?: keyof typeof durationTokens;
  easing?: keyof typeof easingTokens;
}

export function createFadeTransition(options: FadeOptions = {}) {
  const duration = durationTokens[options.duration ?? "normal"];
  const easing = easingTokens[options.easing ?? "ease"];

  return {
    transition: `opacity ${duration} ${easing}`,
  };
}

export const fadeDefaults = {
  in: createFadeTransition({ duration: "normal", easing: "ease-out" }),
  out: createFadeTransition({ duration: "fast", easing: "ease-in" }),
};
