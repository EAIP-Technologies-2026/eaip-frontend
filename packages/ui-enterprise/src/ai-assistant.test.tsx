import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
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
    expect(
      screen.getByRole("button", { name: /Open personal EAIP assistant/i }),
    ).toBeInTheDocument();
  });

  it("sends a message when submitted via input", () => {
    const onSend = vi.fn();
    render(<ConductorWidget messages={[]} onSend={onSend} initialMode="docked" />);

    const input = screen.getByPlaceholderText(/Ask Conductor/i);
    fireEvent.change(input, { target: { value: "Investigate agent performance" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(onSend).toHaveBeenCalledWith("Investigate agent performance");
  });

  it("toggles mic and supports stopping voice session", () => {
    const mockRecognitionInstance = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null as (() => void) | null,
      onresult: null as ((e: unknown) => void) | null,
      onerror: null as ((e: unknown) => void) | null,
      onend: null as (() => void) | null,
      continuous: false,
      interimResults: false,
      lang: "en-US",
    };

    // Mock uses getter/setter so SpeechInputService's assignment
    // of this.recognition.onstart is reflected in mockRecognitionInstance.
    class MockSpeechRecognition {
      public continuous = mockRecognitionInstance.continuous;
      public interimResults = mockRecognitionInstance.interimResults;
      public lang = mockRecognitionInstance.lang;

      get onstart() {
        return mockRecognitionInstance.onstart;
      }
      set onstart(v) {
        mockRecognitionInstance.onstart = v;
      }
      get onresult() {
        return mockRecognitionInstance.onresult;
      }
      set onresult(v) {
        mockRecognitionInstance.onresult = v;
      }
      get onerror() {
        return mockRecognitionInstance.onerror;
      }
      set onerror(v) {
        mockRecognitionInstance.onerror = v;
      }
      get onend() {
        return mockRecognitionInstance.onend;
      }
      set onend(v) {
        mockRecognitionInstance.onend = v;
      }

      public start(): void {
        (mockRecognitionInstance.start as () => void)();
      }
      public stop(): void {
        (mockRecognitionInstance.stop as () => void)();
      }
      public abort(): void {
        (mockRecognitionInstance.abort as () => void)();
      }
    }

    // @ts-expect-error Mock SpeechRecognition on global window object for test environment
    window.SpeechRecognition = MockSpeechRecognition;

    render(<ConductorWidget messages={[]} onSend={vi.fn()} initialMode="docked" />);

    const micBtn = screen.getByLabelText("Push to Talk");
    fireEvent.click(micBtn);

    expect(mockRecognitionInstance.start).toHaveBeenCalled();

    // Trigger recognition start
    act(() => {
      if (typeof mockRecognitionInstance.onstart === "function") {
        mockRecognitionInstance.onstart();
      }
    });

    // Live Voice Session banner should appear with Stop Voice button
    const stopBtn = screen.getByRole("button", { name: "Stop Voice Session" });
    expect(stopBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(stopBtn);
    });
    expect(mockRecognitionInstance.abort).toHaveBeenCalled();

    // @ts-expect-error Remove Mock SpeechRecognition from global window object
    delete window.SpeechRecognition;
  });
});
