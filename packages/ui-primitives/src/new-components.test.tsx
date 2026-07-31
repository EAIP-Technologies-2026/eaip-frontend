import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./form-field";
import { InputGroup } from "./input-group";
import { SearchInput } from "./search-input";
import { RadioGroup, RadioItem } from "./radio-group";
import { ToggleGroup } from "./toggle-group";
import { Chip } from "./chip";
import { Spinner } from "./spinner";

describe("FormField", () => {
  it("renders children", () => {
    render(<FormField><input /></FormField>);
    expect(document.querySelector("input")).toBeDefined();
  });

  it("renders label", () => {
    render(<FormField label="Name" htmlFor="name"><input id="name" /></FormField>);
    expect(screen.getByText("Name")).toBeDefined();
  });

  it("renders required indicator", () => {
    render(<FormField label="Name" required><input /></FormField>);
    expect(document.querySelector(".text-danger")).toBeDefined();
  });

  it("renders error message", () => {
    render(<FormField label="Name" error="Required" htmlFor="name"><input id="name" /></FormField>);
    expect(screen.getByText("Required")).toBeDefined();
    expect(screen.getByText("Required").getAttribute("role")).toBe("alert");
  });

  it("renders help text", () => {
    render(<FormField label="Name" helpText="Enter your name" htmlFor="name"><input id="name" /></FormField>);
    expect(screen.getByText("Enter your name")).toBeDefined();
  });

  it("hides help text when error is present", () => {
    render(<FormField label="Name" helpText="Enter your name" error="Required" htmlFor="name"><input id="name" /></FormField>);
    expect(screen.queryByText("Enter your name")).toBeNull();
  });

  it("renders horizontal orientation", () => {
    const { container } = render(<FormField label="Name" orientation="horizontal"><input /></FormField>);
    expect(container.firstElementChild?.classList.contains("flex-row")).toBe(true);
  });

  it("applies custom className", () => {
    const { container } = render(<FormField className="custom"><input /></FormField>);
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});

describe("InputGroup", () => {
  it("renders input", () => {
    render(<InputGroup placeholder="Enter value" />);
    expect(screen.getByPlaceholderText("Enter value")).toBeDefined();
  });

  it("renders prefix text", () => {
    render(<InputGroup prefix="$" />);
    expect(screen.getByText("$")).toBeDefined();
  });

  it("renders suffix text", () => {
    render(<InputGroup suffix="kg" />);
    expect(screen.getByText("kg")).toBeDefined();
  });

  it("renders error state", () => {
    render(<InputGroup error placeholder="Test" />);
    const input = document.querySelector("input");
    expect(input?.getAttribute("aria-invalid")).toBe("true");
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<InputGroup ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("applies custom className", () => {
    render(<InputGroup className="custom" />);
    expect(document.querySelector("input")?.classList.contains("custom")).toBe(true);
  });
});

describe("SearchInput", () => {
  it("renders search input", () => {
    render(<SearchInput placeholder="Search..." />);
    expect(screen.getByPlaceholderText("Search...")).toBeDefined();
  });

  it("shows clear button when value is present", () => {
    render(<SearchInput value="test" onChange={() => {}} />);
    expect(screen.getByLabelText("Clear search")).toBeDefined();
  });

  it("hides clear button when value is empty", () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("Clear search")).toBeNull();
  });

  it("calls onClear when clear button clicked", () => {
    const onClear = vi.fn();
    render(<SearchInput value="test" onChange={() => {}} onClear={onClear} />);
    screen.getByLabelText("Clear search").click();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("forwards ref", () => {
    const ref = { current: null };
    render(<SearchInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("applies custom className", () => {
    render(<SearchInput className="custom" />);
    expect(document.querySelector("input")?.classList.contains("custom")).toBe(true);
  });
});

describe("RadioGroup", () => {
  it("renders radio options", () => {
    render(
      <RadioGroup value="a" onChange={() => {}} options={[
        { value: "a", label: "Option A" },
        { value: "b", label: "Option B" },
      ]} />
    );
    expect(screen.getByText("Option A")).toBeDefined();
    expect(screen.getByText("Option B")).toBeDefined();
  });

  it("renders with radiogroup role", () => {
    render(<RadioGroup value="a" onChange={() => {}} options={[{ value: "a", label: "A" }]} />);
    expect(document.querySelector("[role='radiogroup']")).toBeDefined();
  });

  it("renders children instead of options", () => {
    render(
      <RadioGroup value="a" onChange={() => {}}>
        <RadioItem value="a">Child A</RadioItem>
      </RadioGroup>
    );
    expect(screen.getByText("Child A")).toBeDefined();
  });

  it("throws when RadioItem is used outside RadioGroup", () => {
    expect(() => render(<RadioItem value="a">Orphan</RadioItem>)).toThrow("RadioItem must be used within a RadioGroup");
  });

  it("calls onChange when radio is clicked", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup value="a" onChange={onChange} options={[
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ]} />
    );
    const radios = document.querySelectorAll<HTMLInputElement>("input[type='radio']");
    const second = radios[1];
    if (second) second.click();
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("renders horizontal orientation", () => {
    const { container } = render(
      <RadioGroup value="a" onChange={() => {}} orientation="horizontal" options={[{ value: "a", label: "A" }]} />
    );
    expect(container.firstElementChild?.classList.contains("flex-row")).toBe(true);
  });

  it("applies custom className", () => {
    const { container } = render(
      <RadioGroup value="a" onChange={() => {}} className="custom" options={[{ value: "a", label: "A" }]} />
    );
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});

describe("ToggleGroup", () => {
  it("renders toggle options", () => {
    render(
      <ToggleGroup value="a" onChange={() => {}} options={[
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ]} />
    );
    expect(screen.getByText("A")).toBeDefined();
    expect(screen.getByText("B")).toBeDefined();
  });

  it("calls onChange when clicked", () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup value="a" onChange={onChange} options={[
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ]} />
    );
    screen.getByText("B").click();
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("renders segmented variant", () => {
    const { container } = render(
      <ToggleGroup value="a" onChange={() => {}} variant="segmented" options={[
        { value: "a", label: "A" },
      ]} />
    );
    expect(container.querySelector("[role='radiogroup']")).toBeDefined();
  });

  it("applies custom className", () => {
    const { container } = render(
      <ToggleGroup value="a" onChange={() => {}} className="custom" options={[{ value: "a", label: "A" }]} />
    );
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});

describe("Chip", () => {
  it("renders children", () => {
    render(<Chip>Label</Chip>);
    expect(screen.getByText("Label")).toBeDefined();
  });

  it("renders removable chip", () => {
    const onRemove = vi.fn();
    render(<Chip removable onRemove={onRemove}>Label</Chip>);
    const removeBtn = screen.getByLabelText("Remove");
    expect(removeBtn).toBeDefined();
    removeBtn.click();
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("renders all variants", () => {
    const variants = ["default", "primary", "success", "warning", "danger", "info"] as const;
    for (const v of variants) {
      const { container } = render(<Chip variant={v}>{v}</Chip>);
      expect(container.firstElementChild).toBeDefined();
    }
  });

  it("renders sizes", () => {
    const sizes = ["sm", "md"] as const;
    for (const s of sizes) {
      const { container } = render(<Chip size={s}>{s}</Chip>);
      expect(container.firstElementChild).toBeDefined();
    }
  });

  it("renders icon", () => {
    render(<Chip icon={<span data-testid="icon" />}>Label</Chip>);
    expect(screen.getByTestId("icon")).toBeDefined();
  });

  it("applies custom className", () => {
    const { container } = render(<Chip className="custom">Label</Chip>);
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});

describe("Spinner", () => {
  it("renders with role status", () => {
    render(<Spinner />);
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("renders all sizes", () => {
    const sizes = ["sm", "md", "lg", "xl"] as const;
    for (const s of sizes) {
      const { container } = render(<Spinner size={s} />);
      expect(container.firstElementChild).toBeDefined();
    }
  });

  it("applies custom className", () => {
    const { container } = render(<Spinner className="custom" />);
    expect(container.firstElementChild?.classList.contains("custom")).toBe(true);
  });
});
