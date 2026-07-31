import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Typography,
  Text,
  Heading,
  Label,
  Caption,
  Code,
  Link,
} from "./index";

describe("Typography (legacy)", () => {
  it("renders body variant by default", () => {
    const { container } = render(<Typography>Hello</Typography>);
    expect(container.querySelector("p")).toBeTruthy();
  });

  it("renders h1 variant as h1 element", () => {
    const { container } = render(<Typography variant="h1">Title</Typography>);
    expect(container.querySelector("h1")).toBeTruthy();
  });
});

describe("Text", () => {
  it("renders as p by default", () => {
    const { container } = render(<Text>Body</Text>);
    expect(container.querySelector("p")).toBeTruthy();
  });

  it("applies size class", () => {
    const { container } = render(<Text size="xl">Large</Text>);
    expect(container.firstElementChild?.classList.contains("text-xl")).toBe(true);
  });

  it("applies color class", () => {
    const { container } = render(<Text color="primary">Primary</Text>);
    expect(container.firstElementChild?.classList.contains("text-primary")).toBe(true);
  });

  it("applies truncate", () => {
    const { container } = render(<Text truncate>Long text</Text>);
    expect(container.firstElementChild?.classList.contains("truncate")).toBe(true);
  });

  it("applies lineClamp", () => {
    const { container } = render(<Text lineClamp={3}>Clamped</Text>);
    expect(container.firstElementChild?.classList.contains("line-clamp-3")).toBe(true);
  });

  it("applies align class", () => {
    const { container } = render(<Text align="center">Centered</Text>);
    expect(container.firstElementChild?.classList.contains("text-center")).toBe(true);
  });

  it("renders as custom element", () => {
    const { container } = render(<Text as="span">Span</Text>);
    expect(container.querySelector("span")).toBeTruthy();
  });
});

describe("Heading", () => {
  it("renders h1 by default", () => {
    const { container } = render(<Heading>Title</Heading>);
    expect(container.querySelector("h1")).toBeTruthy();
  });

  it("renders h2 with level prop", () => {
    const { container } = render(<Heading level={2}>Subtitle</Heading>);
    expect(container.querySelector("h2")).toBeTruthy();
  });

  it("applies size class", () => {
    const { container } = render(<Heading level={1} size="xl">Large H1</Heading>);
    expect(container.firstElementChild?.classList.contains("text-xl")).toBe(true);
  });

  it("applies weight class", () => {
    const { container } = render(<Heading level={2} weight="bold">Bold</Heading>);
    expect(container.firstElementChild?.classList.contains("font-bold")).toBe(true);
  });

  it("applies color class", () => {
    const { container } = render(<Heading level={3} color="primary">Primary</Heading>);
    expect(container.firstElementChild?.classList.contains("text-primary")).toBe(true);
  });

  it("renders all levels", () => {
    for (let i = 1; i <= 6; i++) {
      const { container } = render(<Heading level={i as 1 | 2 | 3 | 4 | 5 | 6}>H{i}</Heading>);
      expect(container.querySelector(`h${String(i)}`)).toBeTruthy();
    }
  });
});

describe("Label", () => {
  it("renders as label", () => {
    const { container } = render(<Label>Name</Label>);
    expect(container.querySelector("label")).toBeTruthy();
  });

  it("shows required indicator", () => {
    const { container } = render(<Label required>Name</Label>);
    expect(container.querySelector(".text-danger")).toBeTruthy();
  });

  it("applies size class", () => {
    const { container } = render(<Label size="lg">Large</Label>);
    expect(container.firstElementChild?.classList.contains("text-base")).toBe(true);
  });
});

describe("Caption", () => {
  it("renders as span by default", () => {
    const { container } = render(<Caption>Note</Caption>);
    expect(container.querySelector("span")).toBeTruthy();
  });

  it("applies color class", () => {
    const { container } = render(<Caption color="muted">Muted</Caption>);
    expect(container.firstElementChild?.classList.contains("text-text-muted")).toBe(true);
  });
});

describe("Code", () => {
  it("renders inline by default", () => {
    const { container } = render(<Code>fn()</Code>);
    expect(container.querySelector("code")).toBeTruthy();
  });

  it("renders block variant", () => {
    const { container } = render(<Code variant="block">const x = 1;</Code>);
    expect(container.firstElementChild?.classList.contains("block")).toBe(true);
  });

  it("applies primary color", () => {
    const { container } = render(<Code color="primary">fn</Code>);
    expect(container.firstElementChild?.classList.contains("text-primary")).toBe(true);
  });
});

describe("Link", () => {
  it("renders as anchor", () => {
    render(<Link href="/">Home</Link>);
    expect(screen.getByText("Home")).toBeDefined();
  });

  it("applies variant class", () => {
    const { container } = render(<Link variant="subtle">Subtle</Link>);
    expect(container.firstElementChild?.classList.contains("text-text-secondary")).toBe(true);
  });

  it("applies underline class when underline prop is true", () => {
    const { container } = render(<Link underline>Underlined</Link>);
    expect(container.firstElementChild?.classList.contains("underline")).toBe(true);
  });

  it("sets href attribute", () => {
    const { container } = render(<Link href="/test">Test</Link>);
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/test");
  });
});
