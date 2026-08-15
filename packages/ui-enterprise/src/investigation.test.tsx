import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { InvestigationCard } from "./investigation-card";
import { InvestigationTimeline } from "./investigation-timeline";
import { EvidenceList } from "./evidence-list";
import type {
  InvestigationSummary,
  TimelineEvent,
  InvestigationEvidence,
} from "./investigation";

const mockInvestigation: InvestigationSummary = {
  id: "inv-001",
  tenant_id: "tenant-1",
  owner_id: "user-1",
  title: "Onboarding Workflow Failure",
  objective: "Determine why onboarding workflow is failing",
  status: "active",
  priority: "high",
  current_stage: "evidence_gathering",
  summary: "",
  findings: [],
  recommendations: [],
  unresolved_questions: ["Root cause of dependency timeout"],
  evidence_count: 3,
  hypothesis_count: 2,
  reasoning_steps_used: 5,
  max_reasoning_steps: 20,
  created_at: "2026-08-14T10:00:00Z",
  updated_at: "2026-08-14T10:08:00Z",
  last_activity_at: "2026-08-14T10:08:00Z",
  completed_at: null,
  expires_at: "2026-09-14T10:00:00Z",
  retention_policy: "30d",
  provenance: "conductor_investigation",
};

const mockTimeline: TimelineEvent[] = [
  {
    id: "tl-1",
    investigation_id: "inv-001",
    timestamp: "2026-08-14T10:02:00Z",
    event_type: "created",
    description: "Investigation created: Onboarding Workflow Failure",
    actor_id: "user-1",
    evidence_id: "",
  },
  {
    id: "tl-2",
    investigation_id: "inv-001",
    timestamp: "2026-08-14T10:04:00Z",
    event_type: "evidence_added",
    description: "OBSERVED: Workflow failed at step Y",
    actor_id: "user-1",
    evidence_id: "ev-1",
  },
  {
    id: "tl-3",
    investigation_id: "inv-001",
    timestamp: "2026-08-14T10:06:00Z",
    event_type: "hypothesis_added",
    description: "Hypothesis: dependency timeout is the cause",
    actor_id: "user-1",
    evidence_id: "",
  },
];

const mockEvidence: InvestigationEvidence[] = [
  {
    id: "ev-1",
    investigation_id: "inv-001",
    evidence_type: "observed",
    source: "tool",
    content: "Workflow X failed at step Y with timeout error",
    source_tool: "runtime_diagnostics",
    source_route: "/workflows",
    confidence: 1.0,
    timestamp: "2026-08-14T10:03:00Z",
    stale: false,
    stale_reason: "",
    correlation_id: "corr-1",
  },
  {
    id: "ev-2",
    investigation_id: "inv-001",
    evidence_type: "inferred",
    source: "system",
    content: "The failure is likely caused by dependency timeout",
    source_tool: "",
    source_route: "",
    confidence: 0.7,
    timestamp: "2026-08-14T10:05:00Z",
    stale: false,
    stale_reason: "",
    correlation_id: "corr-2",
  },
  {
    id: "ev-3",
    investigation_id: "inv-001",
    evidence_type: "recommended",
    source: "system",
    content: "Inspect dependency service health before retrying",
    source_tool: "",
    source_route: "",
    confidence: 0.8,
    timestamp: "2026-08-14T10:07:00Z",
    stale: true,
    stale_reason: "Evidence collected after 3600s pause",
    correlation_id: "corr-3",
  },
];

describe("InvestigationCard", () => {
  afterEach(() => { cleanup(); });

  it("renders investigation title and objective", () => {
    render(
      <InvestigationCard investigation={mockInvestigation} />,
    );
    expect(
      screen.getByText("Onboarding Workflow Failure"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Determine why onboarding workflow is failing",
      ),
    ).toBeInTheDocument();
  });

  it("shows status and priority badges", () => {
    render(
      <InvestigationCard investigation={mockInvestigation} />,
    );
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("shows evidence and hypothesis counts", () => {
    render(
      <InvestigationCard investigation={mockInvestigation} />,
    );
    expect(screen.getByText("3 evidence")).toBeInTheDocument();
    expect(screen.getByText("2 hypotheses")).toBeInTheDocument();
  });

  it("shows unresolved questions count", () => {
    render(
      <InvestigationCard investigation={mockInvestigation} />,
    );
    expect(screen.getByText("1 open")).toBeInTheDocument();
  });

  it("shows Pause button for active investigations", () => {
    const onPause = vi.fn();
    render(
      <InvestigationCard
        investigation={mockInvestigation}
        onPause={onPause}
      />,
    );
    const btn = screen.getByText("Pause");
    fireEvent.click(btn);
    expect(onPause).toHaveBeenCalledWith("inv-001");
  });

  it("shows Resume button for paused investigations", () => {
    const onResume = vi.fn();
    const paused = {
      ...mockInvestigation,
      status: "paused" as const,
    };
    render(
      <InvestigationCard
        investigation={paused}
        onResume={onResume}
      />,
    );
    const btn = screen.getByText("Resume");
    fireEvent.click(btn);
    expect(onResume).toHaveBeenCalledWith("inv-001");
  });

  it("has accessible article role", () => {
    render(
      <InvestigationCard investigation={mockInvestigation} />,
    );
    expect(
      screen.getByRole("article", {
        name: "Investigation: Onboarding Workflow Failure",
      }),
    ).toBeInTheDocument();
  });
});

describe("InvestigationTimeline", () => {
  afterEach(() => { cleanup(); });

  it("renders empty state", () => {
    render(<InvestigationTimeline events={[]} />);
    expect(
      screen.getByText("No timeline events yet."),
    ).toBeInTheDocument();
  });

  it("renders timeline events", () => {
    render(<InvestigationTimeline events={mockTimeline} />);
    expect(
      screen.getByText(
        "Investigation created: Onboarding Workflow Failure",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("OBSERVED: Workflow failed at step Y"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Hypothesis: dependency timeout is the cause",
      ),
    ).toBeInTheDocument();
  });

  it("has accessible list role", () => {
    render(<InvestigationTimeline events={mockTimeline} />);
    expect(
      screen.getByRole("list", {
        name: "Investigation timeline",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});

describe("EvidenceList", () => {
  afterEach(() => { cleanup(); });

  it("renders empty state", () => {
    render(<EvidenceList evidence={[]} />);
    expect(
      screen.getByText("No evidence collected yet."),
    ).toBeInTheDocument();
  });

  it("renders evidence with provenance badges", () => {
    render(<EvidenceList evidence={mockEvidence} />);
    expect(screen.getByText("OBSERVED")).toBeInTheDocument();
    expect(screen.getByText("INFERRED")).toBeInTheDocument();
    expect(screen.getByText("RECOMMENDED")).toBeInTheDocument();
  });

  it("marks stale evidence", () => {
    render(<EvidenceList evidence={mockEvidence} />);
    const staleBadges = screen.getAllByText("STALE");
    expect(staleBadges.length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByText(
        "Evidence collected after 3600s pause",
      ),
    ).toBeInTheDocument();
  });

  it("shows confidence percentages", () => {
    render(<EvidenceList evidence={mockEvidence} />);
    expect(screen.getByText("100% conf")).toBeInTheDocument();
    expect(screen.getByText("70% conf")).toBeInTheDocument();
    expect(screen.getByText("80% conf")).toBeInTheDocument();
  });

  it("has accessible list role", () => {
    render(<EvidenceList evidence={mockEvidence} />);
    expect(
      screen.getByRole("list", {
        name: "Investigation evidence",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
});
