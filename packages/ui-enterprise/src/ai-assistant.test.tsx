import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useConductorStore } from "@eaip/state";
import { ConductorWidget } from "./ai-assistant";

describe("ConductorWidget", () => {
  afterEach(() => {
    cleanup();
    useConductorStore.getState().setMode("collapsed");
  });

  it("renders collapsed trigger button with Conductor label and accessibility attributes", () => {
    render(<ConductorWidget messages={[]} onSend={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: /Open personal EAIP assistant/i });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText("Conductor")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Assistant")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("shows pending approvals count in collapsed mode when approvals exist", () => {
    render(
      <ConductorWidget
        messages={[]}
        onSend={vi.fn()}
        approvals={[
          { id: "appr-1", tool_name: "deploy_agent", arguments: { agent: "agent-1" } },
          { id: "appr-2", tool_name: "restart_service", arguments: { svc: "api" } },
        ]}
      />,
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("transitions from collapsed to docked on click", () => {
    render(<ConductorWidget messages={[]} onSend={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: /Open personal EAIP assistant/i });
    fireEvent.click(trigger);

    expect(screen.getByRole("region", { name: /Personal EAIP Assistant/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask Conductor/i)).toBeInTheDocument();
  });

  it("minimizes back to collapsed mode when minimize button is clicked", () => {
    render(<ConductorWidget messages={[]} onSend={vi.fn()} initialMode="docked" />);
    expect(screen.getByRole("region", { name: /Personal EAIP Assistant/i })).toBeInTheDocument();

    const minimizeBtn = screen.getByLabelText("Minimize Conductor");
    fireEvent.click(minimizeBtn);

    expect(screen.queryByRole("region", { name: /Personal EAIP Assistant/i })).toBeNull();
    expect(screen.getByRole("button", { name: /Open personal EAIP assistant/i })).toBeInTheDocument();
  });

  it("sends a message when submitted via input", () => {
    const onSend = vi.fn();
    render(<ConductorWidget messages={[]} onSend={onSend} initialMode="docked" />);

    const input = screen.getByPlaceholderText(/Ask Conductor/i);
    fireEvent.change(input, { target: { value: "Investigate agent performance" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(onSend).toHaveBeenCalledWith("Investigate agent performance");
  });
});
