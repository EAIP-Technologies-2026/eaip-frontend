import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Box, Flex, Stack, Grid, Container } from "./index";

describe("Box", () => {
  it("renders as div by default", () => {
    const { container } = render(<Box>Content</Box>);
    expect(container.querySelector("div")).toBeTruthy();
  });

  it("renders as custom element", () => {
    const { container } = render(<Box as="section">Section</Box>);
    expect(container.querySelector("section")).toBeTruthy();
  });

  it("applies padding class", () => {
    const { container } = render(<Box padding="md">Padded</Box>);
    expect(container.firstElementChild?.classList.contains("p-4")).toBe(true);
  });

  it("applies custom className", () => {
    const { container } = render(<Box className="custom">Custom</Box>);
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });

  it("applies margin class", () => {
    const { container } = render(<Box margin="lg">Margined</Box>);
    expect(container.firstElementChild?.classList.contains("m-6")).toBe(true);
  });

  it("applies paddingX and paddingY", () => {
    const { container } = render(<Box paddingX="sm" paddingY="md">Padded</Box>);
    expect(container.firstElementChild?.classList.contains("px-2")).toBe(true);
    expect(container.firstElementChild?.classList.contains("py-4")).toBe(true);
  });
});

describe("Flex", () => {
  it("renders with flex class", () => {
    const { container } = render(<Flex>Flex</Flex>);
    expect(container.firstElementChild?.classList.contains("flex")).toBe(true);
  });

  it("renders with direction column", () => {
    const { container } = render(<Flex direction="column">Col</Flex>);
    expect(container.firstElementChild?.classList.contains("flex-col")).toBe(true);
  });

  it("renders with center alignment", () => {
    const { container } = render(<Flex align="center">Centered</Flex>);
    expect(container.firstElementChild?.classList.contains("items-center")).toBe(true);
  });

  it("renders with space between", () => {
    const { container } = render(<Flex justify="between">Between</Flex>);
    expect(container.firstElementChild?.classList.contains("justify-between")).toBe(true);
  });

  it("renders with gap", () => {
    const { container } = render(<Flex gap="lg">Gapped</Flex>);
    expect(container.firstElementChild?.classList.contains("gap-6")).toBe(true);
  });

  it("renders with wrap", () => {
    const { container } = render(<Flex wrap="wrap">Wrapped</Flex>);
    expect(container.firstElementChild?.classList.contains("flex-wrap")).toBe(true);
  });
});

describe("Stack", () => {
  it("renders with flex-col class", () => {
    const { container } = render(<Stack>Stack</Stack>);
    expect(container.firstElementChild?.classList.contains("flex-col")).toBe(true);
  });

  it("renders with default gap", () => {
    const { container } = render(<Stack>Stack</Stack>);
    expect(container.firstElementChild?.classList.contains("gap-4")).toBe(true);
  });

  it("renders with custom gap", () => {
    const { container } = render(<Stack gap="xl">Stack</Stack>);
    expect(container.firstElementChild?.classList.contains("gap-8")).toBe(true);
  });

  it("renders with dividers", () => {
    const { container } = render(<Stack dividers>Stack</Stack>);
    expect(container.firstElementChild?.classList.contains("divide-y")).toBe(true);
    expect(container.firstElementChild?.classList.contains("divide-border")).toBe(true);
  });
});

describe("Grid", () => {
  it("renders with grid class", () => {
    const { container } = render(<Grid>Grid</Grid>);
    expect(container.firstElementChild?.classList.contains("grid")).toBe(true);
  });

  it("renders with columns", () => {
    const { container } = render(<Grid columns={3}>Grid</Grid>);
    expect(container.firstElementChild?.classList.contains("grid-cols-3")).toBe(true);
  });

  it("renders with gap", () => {
    const { container } = render(<Grid gap="md">Grid</Grid>);
    expect(container.firstElementChild?.classList.contains("gap-4")).toBe(true);
  });
});

describe("Container", () => {
  it("renders with container classes", () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstElementChild?.classList.contains("mx-auto")).toBe(true);
    expect(container.firstElementChild?.classList.contains("w-full")).toBe(true);
  });

  it("renders with lg size by default", () => {
    const { container } = render(<Container>Content</Container>);
    expect(container.firstElementChild?.classList.contains("max-w-7xl")).toBe(true);
  });

  it("renders with custom size", () => {
    const { container } = render(<Container size="sm">Content</Container>);
    expect(container.firstElementChild?.classList.contains("max-w-3xl")).toBe(true);
  });

  it("renders with custom element", () => {
    const { container } = render(<Container as="article">Article</Container>);
    expect(container.querySelector("article")).toBeTruthy();
  });
});
