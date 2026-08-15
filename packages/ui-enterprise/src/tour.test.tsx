import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TourInvitation } from "./tour-invitation";
import { TourModeBar } from "./tour-mode";
import type { TourStep } from "./tour";

const mockStep: TourStep = {
  id: "dashboard",
  order: 0,
  route: "/dashboard",
  application: "enterprise_console",
  title: "Dashboard",
  narration: "This is the dashboard.",
  why_it_matters: "It shows your overview.",
  demo_description: "Showing health cards.",
  demo_fixture_type: "",
  demo_safe: true,
};

describe("TourInvitation", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nothing when not visible", () => {
    const { container } = render(
      <TourInvitation visible={false} onAccept={vi.fn()} onDismiss={vi.fn()} onClose={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders invitation when visible", () => {
    render(
      <TourInvitation visible={true} onAccept={vi.fn()} onDismiss={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByText(/Want a guided tour/)).toBeInTheDocument();
    expect(screen.getByText(/I'll walk you through/)).toBeInTheDocument();
  });

  it("calls onAccept when 'Yes, show me' is clicked", () => {
    const onAccept = vi.fn();
    render(
      <TourInvitation visible={true} onAccept={onAccept} onDismiss={vi.fn()} onClose={vi.fn()} />,
    );
    fireEvent.click(screen.getByText("Yes, show me"));
    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it("calls onDismiss when 'Not now' is clicked", () => {
    const onDismiss = vi.fn();
    render(
      <TourInvitation visible={true} onAccept={vi.fn()} onDismiss={onDismiss} onClose={vi.fn()} />,
    );
    fireEvent.click(screen.getByText("Not now"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <TourInvitation visible={true} onAccept={vi.fn()} onDismiss={vi.fn()} onClose={onClose} />,
    );
    fireEvent.click(screen.getByLabelText("Close tour invitation"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("has accessible region role", () => {
    render(
      <TourInvitation visible={true} onAccept={vi.fn()} onDismiss={vi.fn()} onClose={vi.fn()} />,
    );
    expect(screen.getByRole("region", { name: "Guided tour invitation" })).toBeInTheDocument();
  });
});

describe("TourModeBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders nothing when not active", () => {
    const { container } = render(
      <TourModeBar
        active={false}
        state="navigating"
        currentStep={null}
        currentStepIndex={0}
        totalSteps={12}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders tour controls when active", () => {
    render(
      <TourModeBar
        active={true}
        state="navigating"
        currentStep={mockStep}
        currentStepIndex={0}
        totalSteps={12}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText("EAIP Guided Tour")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("1 / 12")).toBeInTheDocument();
  });

  it("shows progress bar with correct width", () => {
    render(
      <TourModeBar
        active={true}
        state="navigating"
        currentStep={mockStep}
        currentStepIndex={2}
        totalSteps={12}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "3");
    expect(progressbar).toHaveAttribute("aria-valuemax", "12");
  });

  it("shows Pause button when navigating", () => {
    render(
      <TourModeBar
        active={true}
        state="navigating"
        currentStep={mockStep}
        currentStepIndex={0}
        totalSteps={12}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText("Pause")).toBeInTheDocument();
  });

  it("shows Resume button when paused", () => {
    render(
      <TourModeBar
        active={true}
        state="paused"
        currentStep={mockStep}
        currentStepIndex={0}
        totalSteps={12}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText("Resume")).toBeInTheDocument();
    expect(screen.getByText("Paused")).toBeInTheDocument();
  });

  it("calls onPause when Pause is clicked", () => {
    const onPause = vi.fn();
    render(
      <TourModeBar
        active={true}
        state="navigating"
        currentStep={mockStep}
        currentStepIndex={0}
        totalSteps={12}
        onPause={onPause}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Pause tour"));
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it("calls onStop when Stop Tour is clicked", () => {
    const onStop = vi.fn();
    render(
      <TourModeBar
        active={true}
        state="navigating"
        currentStep={mockStep}
        currentStepIndex={0}
        totalSteps={12}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={onStop}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Stop tour"));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("disables Previous button at first step", () => {
    render(
      <TourModeBar
        active={true}
        state="navigating"
        currentStep={mockStep}
        currentStepIndex={0}
        totalSteps={12}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    const prevButton = screen.getByLabelText("Previous step");
    expect(prevButton).toBeDisabled();
  });

  it("hides controls when tour is completed", () => {
    render(
      <TourModeBar
        active={true}
        state="completed"
        currentStep={null}
        currentStepIndex={11}
        totalSteps={12}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.queryByText("Pause")).not.toBeInTheDocument();
    expect(screen.queryByText("Stop Tour")).not.toBeInTheDocument();
  });

  it("has accessible region role", () => {
    render(
      <TourModeBar
        active={true}
        state="navigating"
        currentStep={mockStep}
        currentStepIndex={0}
        totalSteps={12}
        onPause={vi.fn()}
        onResume={vi.fn()}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        onStop={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByRole("region", { name: "Guided tour controls" })).toBeInTheDocument();
  });
});
