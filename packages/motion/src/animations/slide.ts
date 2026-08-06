import { durationTokens } from "../tokens/duration";
import { easingTokens } from "../tokens/easing";

export interface SlideOptions {
  direction?: "up" | "down" | "left" | "right";
  distance?: string;
  duration?: keyof typeof durationTokens;
  easing?: keyof typeof easingTokens;
}

export function createSlideTransition(options: SlideOptions = {}) {
  const duration = durationTokens[options.duration ?? "medium"];
  const easing = easingTokens[options.easing ?? "premium"];
  const distance = options.distance ?? "16px";

  const transforms = {
    up: `translateY(${distance})`,
    down: `translateY(-${distance})`,
    left: `translateX(${distance})`,
    right: `translateX(-${distance})`,
  };

  return {
    initialTransform: transforms[options.direction ?? "up"],
    transition: `transform ${duration} ${easing}, opacity ${duration} ${easing}`,
  };
}
