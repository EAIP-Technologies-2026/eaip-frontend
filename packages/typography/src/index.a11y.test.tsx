import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Text,
  Heading,
  Label,
  Caption,
  Code,
  Link,
} from "./index";

describe("Typography Accessibility", () => {
  it("Text renders with correct semantics", () => {
    render(<Text>Content</Text>);
    const el = screen.getByText("Content");
    expect(el).toBeDefined();
  });

  it("Heading renders with correct ARIA role", () => {
    render(<Heading level={1}>Title</Heading>);
    expect(screen.getByRole("heading", { level: 1 })).toBeDefined();
  });

  it("Heading level 2 has correct role", () => {
    render(<Heading level={2}>Subtitle</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeDefined();
  });

  it("Label is associated with form control", () => {
    render(
      <>
        <Label htmlFor="input">Name</Label>
        <input id="input" />
      </>,
    );
    const label = screen.getByText("Name");
    expect(label).toBeDefined();
  });

  it("Link has correct role", () => {
    render(<Link href="/">Home</Link>);
    expect(screen.getByRole("link", { name: "Home" })).toBeDefined();
  });

  it("Code renders inline without extra semantics", () => {
    const { container } = render(<Code>inline code</Code>);
    const code = container.querySelector("code");
    expect(code).toBeDefined();
  });

  it("Caption uses correct tag", () => {
    const { container } = render(<Caption>Note text</Caption>);
    expect(container.querySelector("span")).toBeTruthy();
  });

  it("All components render without console error", () => {
    const spy = vi.spyOn(console, "error");
    render(
      <div>
        <Text>Text</Text>
        <Heading>Heading</Heading>
        <Label>Label</Label>
        <Caption>Caption</Caption>
        <Code>Code</Code>
        <Link href="/">Link</Link>
      </div>,
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("Link is keyboard focusable", () => {
    render(<Link href="/">Focusable Link</Link>);
    const link = screen.getByText("Focusable Link");
    link.focus();
    expect(document.activeElement).toBe(link);
  });
});
