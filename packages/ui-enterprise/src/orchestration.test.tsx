import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { OrchestrationPlanCard } from "./orchestration-plan-card";
import type { OrchestrationPlanSummary } from "./orchestration";

const mockPlan: OrchestrationPlanSummary = {
  id: "plan-001",
  tenant_id: "tenant-1",
  owner_id: "user-1",
  objective: "Prepare platform for deployment",
  description: "Check health, verify services, prepare remediation",
  status: "running",
  risk: "action",
  steps: [
    {
      id: "step-1",
      description: "Inspect system health",
      tool_name: "system_health",
      risk: "informational",
      status: "completed",
      dependencies: [],
      approval_required: false,
      reversible: false,
      result: '{"status": "healthy"}',
      error: "",
      failure_class: "unknown",
      retry_count: 0,
    },
    {
      id: "step-2",
      description: "Verify deployment dependencies",
      tool_name: "list_workflows",
      risk: "informational",
      status: "running",
      dependencies: ["step-1"],
      approval_required: false,
      reversible: false,
      result: "",
      error: "",
      failure_class: "unknown",
      retry_count: 0,
    },
    {
      id: "step-3",
      description: "Prepare remediation actions",
      tool_name: "create_agent",
      risk: "action",
      status: "pending",
      dependencies: ["step-2"],
      approval_required: true,
      reversible: true,
      result: "",
      error: "",
      failure_class: "unknown",
      retry_count: 0,
    },
    {
      id: "step-4",
      description: "Execute approved changes",
      tool_name: "run_workflow",
      risk: "destructive",
      status: "pending",
      dependencies: ["step-3"],
      approval_required: true,
      reversible: true,
      result: "",
      error: "",
      failure_class: "unknown",
      retry_count: 0,
    },
  ],
  current_step_index: 1,
  estimated_risk: "action",
  approval_required: true,
  investigation_id: "",
  budget: {
    max_steps: 20,
    max_tool_calls: 50,
    max_retries: 3,
    max_execution_seconds: 600,
    max_concurrent_steps: 3,
    max_destructive_actions: 2,
    max_rollbacks: 5,
  },
  tool_calls_used: 2,
  retries_used: 0,
  rollbacks_used: 0,
  result_summary: "",
  failure_info: "",
  plan_hash: "abc123",
  created_at: "2026-08-14T10:00:00Z",
  updated_at: "2026-08-14T10:05:00Z",
  started_at: "2026-08-14T10:01:00Z",
  completed_at: null,
  provenance: "conductor_orchestration",
};

describe("OrchestrationPlanCard", () => {
  afterEach(() => { cleanup(); });

  it("renders plan objective", () => {
    render(<OrchestrationPlanCard plan={mockPlan} />);
    expect(
      screen.getByText("Prepare platform for deployment"),
    ).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<OrchestrationPlanCard plan={mockPlan} />);
    expect(
      screen.getByText(
        "Check health, verify services, prepare remediation",
      ),
    ).toBeInTheDocument();
  });

  it("shows status and risk badges", () => {
    render(<OrchestrationPlanCard plan={mockPlan} />);
    expect(screen.getByText("Running")).toBeInTheDocument();
    expect(screen.getByText("action")).toBeInTheDocument();
  });

  it("shows step progress", () => {
    render(<OrchestrationPlanCard plan={mockPlan} />);
    expect(screen.getByText("1/4 steps")).toBeInTheDocument();
  });

  it("shows tool call budget usage", () => {
    render(<OrchestrationPlanCard plan={mockPlan} />);
    expect(screen.getByText("2/50 tool calls")).toBeInTheDocument();
  });

  it("shows approval required badge", () => {
    render(<OrchestrationPlanCard plan={mockPlan} />);
    expect(
      screen.getByText("Approval required"),
    ).toBeInTheDocument();
  });

  it("shows step indicators", () => {
    render(<OrchestrationPlanCard plan={mockPlan} />);
    expect(
      screen.getByText("Inspect system health"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Verify deployment dependencies"),
    ).toBeInTheDocument();
  });

  it("shows Pause button for running plans", () => {
    const onPause = vi.fn();
    render(
      <OrchestrationPlanCard plan={mockPlan} onPause={onPause} />,
    );
    const btn = screen.getByText("Pause");
    fireEvent.click(btn);
    expect(onPause).toHaveBeenCalledWith("plan-001");
  });

  it("shows Approve button for awaiting_approval plans", () => {
    const onApprove = vi.fn();
    const awaiting = {
      ...mockPlan,
      status: "awaiting_approval" as const,
    };
    render(
      <OrchestrationPlanCard
        plan={awaiting}
        onApprove={onApprove}
      />,
    );
    const btn = screen.getByText("Approve");
    fireEvent.click(btn);
    expect(onApprove).toHaveBeenCalledWith("plan-001");
  });

  it("shows Execute button for approved plans", () => {
    const onExecute = vi.fn();
    const approved = { ...mockPlan, status: "approved" as const };
    render(
      <OrchestrationPlanCard
        plan={approved}
        onExecute={onExecute}
      />,
    );
    const btn = screen.getByText("Execute");
    fireEvent.click(btn);
    expect(onExecute).toHaveBeenCalledWith("plan-001");
  });

  it("has accessible article role", () => {
    render(<OrchestrationPlanCard plan={mockPlan} />);
    expect(
      screen.getByRole("article", {
        name: "Plan: Prepare platform for deployment",
      }),
    ).toBeInTheDocument();
  });

  it("has progressbar with correct values", () => {
    render(<OrchestrationPlanCard plan={mockPlan} />);
    const pb = screen.getByRole("progressbar");
    expect(pb).toHaveAttribute("aria-valuenow", "1");
    expect(pb).toHaveAttribute("aria-valuemax", "4");
  });
});
