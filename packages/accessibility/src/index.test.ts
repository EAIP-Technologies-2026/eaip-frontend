import { describe, it, expect } from "vitest";
import { mergeAriaProps } from "./index";

describe("mergeAriaProps", () => {
  it("merges multiple aria prop objects", () => {
    const result = mergeAriaProps(
      { "aria-label": "close" },
      { "aria-hidden": true },
    );
    expect(result).toEqual({
      "aria-label": "close",
      "aria-hidden": true,
    });
  });

  it("skips undefined entries", () => {
    const result = mergeAriaProps({ "aria-label": "test" }, undefined);
    expect(result).toEqual({ "aria-label": "test" });
  });

  it("returns empty object for no inputs", () => {
    expect(mergeAriaProps()).toEqual({});
  });
});
