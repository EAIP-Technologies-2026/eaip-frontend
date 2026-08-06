export const easingTokens = {
  linear: "linear",
  ease: "ease",
  "ease-in": "ease-in",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  premium: "cubic-bezier(0.16, 1, 0.3, 1)",
  snappy: "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

export type MotionEasingToken = keyof typeof easingTokens;
export type MotionEasingValue = (typeof easingTokens)[MotionEasingToken];
