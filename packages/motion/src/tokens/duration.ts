export const durationTokens = {
  instant: "0ms",
  micro: "100ms",
  fast: "150ms",
  normal: "250ms",
  medium: "350ms",
  slow: "450ms",
  deliberate: "600ms",
} as const;

export type MotionDurationToken = keyof typeof durationTokens;
export type MotionDurationValue = (typeof durationTokens)[MotionDurationToken];
