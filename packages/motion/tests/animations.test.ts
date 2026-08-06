import { describe, it, expect } from "vitest";
import { createFadeTransition, createSlideTransition, createScaleTransition } from "../src/index";

describe("Motion Primitives", () => {
  it("creates fade transition using duration and easing tokens", () => {
    const fade = createFadeTransition({ duration: "fast", easing: "ease-out" });
    expect(fade.transition).toBe("opacity 150ms ease-out");
  });

  it("creates slide transition with direction and distance", () => {
    const slide = createSlideTransition({ direction: "up", distance: "12px", duration: "slow" });
    expect(slide.initialTransform).toBe("translateY(12px)");
    expect(slide.transition).toBe(
      "transform 450ms cubic-bezier(0.16, 1, 0.3, 1), opacity 450ms cubic-bezier(0.16, 1, 0.3, 1)",
    );
  });

  it("creates scale transition with snappy easing", () => {
    const scale = createScaleTransition({ initialScale: 0.97, duration: "micro" });
    expect(scale.initialScale).toBe(0.97);
    expect(scale.transition).toBe(
      "transform 100ms cubic-bezier(0.4, 0, 0.2, 1), opacity 100ms cubic-bezier(0.4, 0, 0.2, 1)",
    );
  });
});
