import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import BrainCommandCenterPage from "./page";
import { ThemeProvider } from "@eaip/theme";

const push = vi.fn();

const mockBrain = {
  id: "brain-test-1",
  name: "Test Brain",
  description: "A test brain.",
  businessFunction: "Marketing",
  ownerId: "test-user",
  objectives: ["Grow revenue"],
  instructions: "",
  knowledgeSources: ["marketing-research"],
  rules: ["Rule one"],
  tools: [],
  approvalRequired: true,
  status: "active",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  recommendations: [],
  missionIds: [],
  memoryIds: [],
  activity: [
    {
      id: "act-1",
      action: "created",
      message: "Brain created",
      timestamp: new Date().toISOString(),
    },
  ],
};

const mockCollections = [
  {
    id: "col-1",
    name: "marketing-research",
    description: "Market analysis documents",
    documentCount: 5,
    totalSize: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "col-2",
    name: "sales-playbook",
    description: "Sales strategies",
    documentCount: 3,
    totalSize: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "col-3",
    name: "engineering-docs",
    description: "Technical documentation",
    documentCount: 12,
    totalSize: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let currentBrain = { ...mockBrain };

const fetchBrain = vi.fn().mockImplementation(() => Promise.resolve(currentBrain));
const configureBrain = vi.fn().mockImplementation((_id: string, body: Record<string, unknown>) => {
  if (body.knowledgeSources) {
    currentBrain = { ...currentBrain, knowledgeSources: body.knowledgeSources as string[] };
  }
  return Promise.resolve(currentBrain);
});
const queryBrain = vi.fn();
const approveRecommendation = vi.fn();
const rejectRecommendation = vi.fn();
const executeAction = vi.fn();
const rememberBrain = vi.fn();

const listCollections = vi.fn().mockResolvedValue(mockCollections);

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

vi.mock("@eaip/auth", () => ({
  RequireAuth: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: { id: "test-user", name: "Test User" },
    logout: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useParams: () => ({ id: "brain-test-1" }),
}));

vi.mock("../../../services/brains-service", () => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  fetchBrain: (...args: unknown[]) => fetchBrain(...args),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  configureBrain: (...args: unknown[]) => configureBrain(...args),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  queryBrain: (...args: unknown[]) => queryBrain(...args),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  approveRecommendation: (...args: unknown[]) => approveRecommendation(...args),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  rejectRecommendation: (...args: unknown[]) => rejectRecommendation(...args),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  executeAction: (...args: unknown[]) => executeAction(...args),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  rememberBrain: (...args: unknown[]) => rememberBrain(...args),
}));

vi.mock("@eaip/knowledge", () => ({
  ApiKnowledgeClient: class MockKnowledgeClient {
    listCollections() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return listCollections();
    }
  },
}));

function renderBrainPage(overrides?: Partial<typeof mockBrain>) {
  currentBrain = { ...mockBrain, ...overrides };
  fetchBrain.mockImplementation(() => Promise.resolve(currentBrain));
  return render(
    <ThemeProvider defaultMode="light" defaultVariant="enterprise-light">
      <BrainCommandCenterPage />
    </ThemeProvider>,
  );
}

describe("Brain Knowledge Source Picker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchBrain.mockImplementation(() => Promise.resolve(currentBrain));
    configureBrain.mockImplementation(
      (_id: string, body: Record<string, unknown>) => {
        if (body.knowledgeSources) {
          currentBrain = {
            ...currentBrain,
            knowledgeSources: body.knowledgeSources as string[],
          };
        }
        return Promise.resolve(currentBrain);
      },
    );
    listCollections.mockResolvedValue(mockCollections);
  });

  it("displays attached knowledge sources", async () => {
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("Knowledge Sources")).toBeTruthy();
    });
    expect(screen.getByText("marketing-research")).toBeTruthy();
  });

  it("shows Add Knowledge button", async () => {
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("Knowledge Sources")).toBeTruthy();
    });
    expect(screen.getByText("Add Knowledge")).toBeTruthy();
  });

  it("opens picker dialog when Add Knowledge is clicked", async () => {
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("Add Knowledge")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Add Knowledge"));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
  });

  it("loads and displays knowledge collections in picker", async () => {
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("Add Knowledge")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Add Knowledge"));
    await waitFor(() => {
      expect(screen.getByText("sales-playbook")).toBeTruthy();
      expect(screen.getByText("engineering-docs")).toBeTruthy();
    });
  });

  it("filters collections by search input", async () => {
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("Add Knowledge")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Add Knowledge"));
    await waitFor(() => {
      expect(screen.getByText("sales-playbook")).toBeTruthy();
    });
    const searchInput = screen.getByPlaceholderText("Search knowledge sources...");
    fireEvent.change(searchInput, { target: { value: "engineering" } });
    expect(screen.queryByText("sales-playbook")).toBeNull();
    expect(screen.getByText("engineering-docs")).toBeTruthy();
  });

  it("allows selecting multiple sources", async () => {
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("Add Knowledge")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Add Knowledge"));
    await waitFor(() => {
      expect(screen.getByText("sales-playbook")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("sales-playbook"));
    fireEvent.click(screen.getByText("engineering-docs"));
    await waitFor(() => {
      expect(screen.getByText("3 sources selected")).toBeTruthy();
    });
  });

  it("saves selection via configureBrain", async () => {
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("Add Knowledge")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Add Knowledge"));
    await waitFor(() => {
      expect(screen.getByText("sales-playbook")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("sales-playbook"));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(
      dialog.querySelector('button:not([type="button"])') ??
        screen.getByRole("button", { name: "Save" }),
    );
    await waitFor(() => {
      expect(configureBrain).toHaveBeenCalledWith(
        "brain-test-1",
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          knowledgeSources: expect.arrayContaining([
            "marketing-research",
            "sales-playbook",
          ]),
        }),
      );
    });
  });

  it("shows empty state when no collections exist", async () => {
    listCollections.mockResolvedValue([]);
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("Add Knowledge")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Add Knowledge"));
    await waitFor(() => {
      expect(screen.getByText("No knowledge sources available")).toBeTruthy();
    });
  });

  it("shows error state when loading fails", async () => {
    listCollections.mockRejectedValue(new Error("Network error"));
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("Add Knowledge")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Add Knowledge"));
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeTruthy();
    });
  });

  it("shows remove confirmation for attached sources", async () => {
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("marketing-research")).toBeTruthy();
    });
    const removeBtn = screen.getByLabelText("Remove marketing-research");
    fireEvent.click(removeBtn);
    await waitFor(() => {
      expect(screen.getByText("Remove Knowledge Source")).toBeTruthy();
    });
  });

  it("removes a source on confirm", async () => {
    renderBrainPage();
    await waitFor(() => {
      expect(screen.getByText("marketing-research")).toBeTruthy();
    });
    fireEvent.click(screen.getByLabelText("Remove marketing-research"));
    await waitFor(() => {
      expect(screen.getByText("Remove Knowledge Source")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Remove"));
    await waitFor(() => {
      expect(configureBrain).toHaveBeenCalledWith("brain-test-1", {
        knowledgeSources: [],
      });
    });
  });

  it("shows empty state when no sources attached", async () => {
    renderBrainPage({ knowledgeSources: [] });
    await waitFor(() => {
      expect(screen.getByText("No knowledge sources connected")).toBeTruthy();
    });
  });
});

const mockRecommendation = {
  id: "rec-test-1",
  title: "Qualified lead conversion has declined",
  rationale: "Evidence suggests a 15% drop in qualified leads over the past quarter.",
  evidence: [{ source_type: "knowledge", source_id: "chunk-1", content_preview: "Lead metrics show decline.", relevance_score: 0.85 }],
  confidence: 0.75,
  status: "pending_approval",
  approvalRequired: true,
  executionStatus: "ready_for_execution_integration",
};

const mockApprovedRecommendation = {
  ...mockRecommendation,
  id: "rec-test-2",
  status: "approved",
  executionStatus: "ready_for_execution_integration",
};

const mockExecutedRecommendation = {
  ...mockRecommendation,
  id: "rec-test-3",
  status: "mission_created",
  executionStatus: "executed",
  executionResult: "Mission completed: no agents or workflows to execute",
  missionId: "mission-test-1",
};

describe("Brain Action Center", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchBrain.mockImplementation(() => Promise.resolve(currentBrain));
    configureBrain.mockImplementation((_id: string, body: Record<string, unknown>) => {
      if (body.knowledgeSources) {
        currentBrain = { ...currentBrain, knowledgeSources: body.knowledgeSources as string[] };
      }
      return Promise.resolve(currentBrain);
    });
    listCollections.mockResolvedValue(mockCollections);
  });

  it("shows Action Center when recommendations exist", async () => {
    renderBrainPage({ recommendations: [mockRecommendation] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText("Action Center")).toBeTruthy();
    });
    expect(screen.getByText("Qualified lead conversion has declined")).toBeTruthy();
    expect(screen.getByText("pending approval")).toBeTruthy();
  });

  it("shows impact, risk, and approval cards", async () => {
    renderBrainPage({ recommendations: [mockRecommendation] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText("Expected Impact")).toBeTruthy();
    });
    expect(screen.getByText("Risk Level")).toBeTruthy();
    expect(screen.getByText("Approval")).toBeTruthy();
    expect(screen.getByText("Low")).toBeTruthy();
  });

  it("shows Approve and Reject buttons for pending recommendations", async () => {
    renderBrainPage({ recommendations: [mockRecommendation] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText("Approve")).toBeTruthy();
    });
    expect(screen.getByText("Reject")).toBeTruthy();
  });

  it("calls approveRecommendation on Approve click", async () => {
    approveRecommendation.mockResolvedValue({ ...mockRecommendation, status: "approved" });
    renderBrainPage({ recommendations: [mockRecommendation] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText("Approve")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Approve"));
    await waitFor(() => {
      expect(approveRecommendation).toHaveBeenCalledWith("brain-test-1", "rec-test-1");
    });
  });

  it("calls rejectRecommendation on Reject click", async () => {
    rejectRecommendation.mockResolvedValue({ ...mockRecommendation, status: "rejected" });
    renderBrainPage({ recommendations: [mockRecommendation] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText("Reject")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Reject"));
    await waitFor(() => {
      expect(rejectRecommendation).toHaveBeenCalledWith("brain-test-1", "rec-test-1");
    });
  });

  it("shows Execute Action button for approved recommendations", async () => {
    renderBrainPage({ recommendations: [mockApprovedRecommendation] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText("Execute Action")).toBeTruthy();
    });
  });

  it("calls executeAction on Execute click", async () => {
    executeAction.mockResolvedValue({
      missionId: "mission-test-1",
      mission: { id: "mission-test-1", status: "completed" },
      executionStatus: "executed",
      executionResult: "Mission completed",
    });
    renderBrainPage({ recommendations: [mockApprovedRecommendation] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText("Execute Action")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Execute Action"));
    await waitFor(() => {
      expect(executeAction).toHaveBeenCalledWith("brain-test-1", "rec-test-2");
    });
  });

  it("shows execution result when executed", async () => {
    renderBrainPage({ recommendations: [mockExecutedRecommendation] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText("Execution Result")).toBeTruthy();
    });
    expect(screen.getByText("Action executed successfully.")).toBeTruthy();
  });

  it("shows rejected state", async () => {
    const rejected = { ...mockRecommendation, status: "rejected", executionStatus: "rejected" };
    renderBrainPage({ recommendations: [rejected] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText("Action rejected.")).toBeTruthy();
    });
  });

  it("shows integration-pending state", async () => {
    const ready = { ...mockApprovedRecommendation, executionStatus: "ready_for_integration" };
    renderBrainPage({ recommendations: [ready] } as Partial<typeof mockBrain>);
    await waitFor(() => {
      expect(screen.getByText(/Ready for integration/)).toBeTruthy();
    });
  });
});
