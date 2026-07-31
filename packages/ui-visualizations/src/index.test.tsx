import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusRing, ProgressBar } from "./index";

describe("StatusRing", () => {
  it("renders with status label", () => {
    render(<StatusRing status="running" />);
    expect(screen.getByLabelText("Status: running")).toBeTruthy();
  });
});

describe("ProgressBar", () => {
  it("renders with label and percentage", () => {
    render(<ProgressBar value={50} label="Loading" />);
    expect(screen.getByText("Loading")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();
  });
});
