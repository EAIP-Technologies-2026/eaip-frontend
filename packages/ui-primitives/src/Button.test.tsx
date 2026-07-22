import { describe, it } from "vitest";
import { expect } from "@storybook/test";
import { render, screen } from "@testing-library/react";
import { Button } from "./index";

describe("Button", () => {
  it("renders children", async () => {
    render(<Button>Click me</Button>);
    await expect(screen.getByText("Click me")).toBeDefined();
  });

  it("renders as disabled", async () => {
    render(<Button disabled>Disabled</Button>);
    await expect(screen.getByText("Disabled")).toBeDefined();
  });
});
