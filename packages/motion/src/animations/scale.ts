import { durationTokens } from "../tokens/duration";
import { easingTokens } from "../tokens/easing";

export interface ScaleOptions {
  initialScale?: number;
  duration?: keyof typeof durationTokens;
  easing?: keyof typeof easingTokens;
}

export function createScaleTransition(options: ScaleOptions = {}) {
  const duration = durationTokens[options.duration ?? "fast"];
  const easing = easingTokens[options.easing ?? "snappy"];
  const scale = options.initialScale ?? 0.95;

  return {
    initialScale: scale,
    transition: `transform ${duration} ${easing}, opacity ${duration} ${easing}`,
  };
}
