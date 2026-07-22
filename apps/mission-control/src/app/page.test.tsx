import { describe, it } from "vitest";
import { expect } from "@storybook/test";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders heading", async () => {
    render(<Home />);
    await expect(screen.getByRole("heading")).toBeDefined();
  });
});
