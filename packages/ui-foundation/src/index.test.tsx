import { describe, it } from "vitest";
import { expect } from "@storybook/test";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardContent } from "./index";

describe("Card", () => {
  it("renders children", async () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardContent>Content</CardContent>
      </Card>,
    );
    await expect(screen.getByText("Header")).toBeDefined();
    await expect(screen.getByText("Content")).toBeDefined();
  });
});
