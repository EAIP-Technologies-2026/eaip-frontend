import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardContent } from "./index";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><CardHeader>Header</CardHeader><CardContent>Content</CardContent></Card>);
    expect(screen.getByText("Header")).toBeDefined();
    expect(screen.getByText("Content")).toBeDefined();
  });
});