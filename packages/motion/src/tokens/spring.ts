export const springTokens = {
  stiffness: 300,
  damping: 30,
  mass: 1,
} as const;

export type MotionSpringTokens = typeof springTokens;
