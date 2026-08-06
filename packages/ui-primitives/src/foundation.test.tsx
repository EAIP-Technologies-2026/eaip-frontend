import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IconButton } from "./icon-button";
import { Divider } from "./divider";
import { Tabs } from "./tabs";
import { Tooltip } from "./tooltip";
import { Popover } from "./popover";
import { Skeleton, EmptyState, LoadingState, ErrorState } from "./states";
import { LinearProgress, CircularProgress } from "./progress";
import { Input } from "./index";

describe("Sprint 2C-2F Foundation Components", () => {
  it("renders IconButton with correct attributes and handles click", () => {
    const handleClick = vi.fn();
    render(
      <IconButton aria-label="Search button" onClick={handleClick}>
        <span>Icon</span>
      </IconButton>,
    );
    const btn = screen.getByRole("button", { name: "Search button" });
    expect(btn).toBeDefined();
    expect(btn.getAttribute("data-slot")).toBe("icon-button");
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders Divider with horizontal and vertical orientations", () => {
    const { container: hContainer } = render(<Divider label="Separator" />);
    expect(hContainer.querySelector("[data-slot='divider']")).toBeDefined();

    const { container: vContainer } = render(<Divider orientation="vertical" />);
    expect(vContainer.querySelector("[data-orientation='vertical']")).toBeDefined();
  });

  it("renders compound Tabs and switches tabs on trigger click", () => {
    render(
      <Tabs defaultValue="tab1">
        <Tabs.List aria-label="Test Tabs">
          <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">Content 1</Tabs.Content>
        <Tabs.Content value="tab2">Content 2</Tabs.Content>
      </Tabs>,
    );

    expect(screen.getByRole("tablist")).toBeDefined();
    expect(screen.getByText("Content 1")).toBeDefined();

    fireEvent.click(screen.getByRole("tab", { name: "Tab 2" }));
    expect(screen.getByText("Content 2")).toBeDefined();
  });

  it("renders Tooltip trigger and shows content on mouse enter", () => {
    render(
      <Tooltip>
        <Tooltip.Trigger>Hover me</Tooltip.Trigger>
        <Tooltip.Content>Tooltip text</Tooltip.Content>
      </Tooltip>,
    );

    const trigger = screen.getByText("Hover me");
    expect(trigger).toBeDefined();
    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole("tooltip")).toBeDefined();
  });

  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    width: 100,
    height: 40,
    top: 100,
    left: 100,
    bottom: 140,
    right: 200,
  });

  it("renders Popover and toggles content on trigger click", () => {
    render(
      <Popover>
        <Popover.Trigger>Open Popover</Popover.Trigger>
        <Popover.Content>Popover Body</Popover.Content>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Open Popover" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("renders States primitives (Skeleton, EmptyState, LoadingState, ErrorState)", () => {
    render(
      <div>
        <Skeleton width="100px" height="20px" />
        <EmptyState title="No Records" />
        <LoadingState message="Fetching data..." />
        <ErrorState title="Error occurred" />
      </div>,
    );

    expect(screen.getByText("No Records")).toBeDefined();
    expect(screen.getByText("Fetching data...")).toBeDefined();
    expect(screen.getByText("Error occurred")).toBeDefined();
  });

  it("renders Progress indicators correctly", () => {
    render(
      <div>
        <LinearProgress value={50} showLabel />
        <CircularProgress value={75} showLabel />
      </div>,
    );

    const progressbars = screen.getAllByRole("progressbar");
    expect(progressbars.length).toBe(2);
  });

  it("renders Input with type password visibility toggle", () => {
    render(<Input label="Password" type="password" placeholder="Pass123" />);
    const toggleBtn = screen.getByRole("button", { name: "Show password" });
    expect(toggleBtn).toBeDefined();
    fireEvent.click(toggleBtn);
    expect(screen.getByRole("button", { name: "Hide password" })).toBeDefined();
  });
});
