import { describe, it } from "vitest";
import { expect } from "@storybook/test";
import { renderWithProviders } from "./index";

describe("testing utilities", () => {
  it("renderWithProviders works", async () => {
    const { container } = renderWithProviders(<div>test</div>);
    await expect(container.textContent).toBe("test");
  });
});
