import { describe, it, expect } from "vitest";
import { renderWithProviders } from "./index";

describe("testing utilities", () => {
  it("renderWithProviders works", () => {
    const { container } = renderWithProviders(<div>test</div>);
    expect(container.textContent).toBe("test");
  });
});
