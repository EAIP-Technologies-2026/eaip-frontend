import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { EnterpriseIcon, IconPlaceholder } from "./index";

describe("EnterpriseIcon", () => {
  it("renders an icon by name", () => {
    const { container } = render(<EnterpriseIcon name="check" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders with aria-hidden", () => {
    const { container } = render(<EnterpriseIcon name="x" />);
    expect(container.querySelector("[aria-hidden='true']")).toBeTruthy();
  });
});

describe("IconPlaceholder", () => {
  it("renders a placeholder svg", () => {
    const { container } = render(<IconPlaceholder />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("applies custom size", () => {
    const { container } = render(<IconPlaceholder size={48} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("48");
  });
});
