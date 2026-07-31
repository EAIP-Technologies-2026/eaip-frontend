import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardContent } from "./card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><CardContent>Hello</CardContent></Card>);
    expect(screen.getByText("Hello")).toBeTruthy();
  });
});
