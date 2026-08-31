import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SpeechInputService, SpeechOutputService } from "./speech-services";

describe("SpeechInputService", () => {
  let mockRecognitionInstance: {
    start: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
    onstart: (() => void) | null;
    onresult: ((e: unknown) => void) | null;
    onerror: ((e: unknown) => void) | null;
    onend: (() => void) | null;
    continuous: boolean;
    interimResults: boolean;
    lang: string;
  };

  beforeEach(() => {
    mockRecognitionInstance = {
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
  });

  afterEach(() => {
    // @ts-expect-error Remove Mock SpeechRecognition from global window object
    delete window.SpeechRecognition;
  });

  it("creates service and starts listening", () => {
    const onStateChange = vi.fn();
    const service = new SpeechInputService({ onStateChange });

    expect(service.isSupported()).toBe(true);
    service.start();
    expect(mockRecognitionInstance.start).toHaveBeenCalled();

    // Trigger onstart
    mockRecognitionInstance.onstart?.();
    expect(onStateChange).toHaveBeenCalledWith("listening");
    expect(service.getListening()).toBe(true);
  });

  it("stops and aborts listening on stop() and cancel()", () => {
    const onStateChange = vi.fn();
    const service = new SpeechInputService({ onStateChange });

    service.start();
    mockRecognitionInstance.onstart?.();

    service.stop();
    expect(mockRecognitionInstance.stop).toHaveBeenCalled();

    service.cancel();
    expect(mockRecognitionInstance.abort).toHaveBeenCalled();
    expect(onStateChange).toHaveBeenCalledWith("idle");
    expect(service.getListening()).toBe(false);
  });

  it("cleans up resources on destroy()", () => {
    const service = new SpeechInputService();
    service.start();
    service.destroy();

    expect(mockRecognitionInstance.abort).toHaveBeenCalled();
    expect(mockRecognitionInstance.onstart).toBeNull();
    expect(mockRecognitionInstance.onresult).toBeNull();
    expect(mockRecognitionInstance.onerror).toBeNull();
    expect(mockRecognitionInstance.onend).toBeNull();
    expect(service.isSupported()).toBe(false);
  });
});

describe("SpeechOutputService", () => {
  let mockSynth: {
    speak: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockSynth = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    };

    class MockSpeechSynthesisUtterance {
      public rate = 1;
      public pitch = 1;
      public onend: (() => void) | null = null;
      public onerror: (() => void) | null = null;
      constructor(public text: string) {}
    }

    // @ts-expect-error Mock speechSynthesis on global window object for test environment
    window.speechSynthesis = mockSynth;
    // @ts-expect-error Mock SpeechSynthesisUtterance constructor on window for test environment
    window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  });

  afterEach(() => {
    // @ts-expect-error Remove Mock speechSynthesis from global window object
    delete window.speechSynthesis;
    // @ts-expect-error Remove Mock SpeechSynthesisUtterance from global window object
    delete window.SpeechSynthesisUtterance;
  });

  it("speaks formatted text and terminates cleanly on cancel()", () => {
    const service = new SpeechOutputService();
    expect(service.isSupported()).toBe(true);

    service.speak("Hello EAIP world");
    expect(mockSynth.speak).toHaveBeenCalled();

    service.cancel();
    expect(mockSynth.cancel).toHaveBeenCalled();
  });

  it("pauses and resumes speech synthesis", () => {
    const service = new SpeechOutputService();
    service.pause();
    expect(mockSynth.pause).toHaveBeenCalled();

    service.resume();
    expect(mockSynth.resume).toHaveBeenCalled();
  });

  it("destroys output service and prevents subsequent calls", () => {
    const service = new SpeechOutputService();
    service.destroy();
    expect(mockSynth.cancel).toHaveBeenCalled();
    expect(service.isSupported()).toBe(false);

    service.speak("Should not speak");
    expect(mockSynth.speak).not.toHaveBeenCalled();
  });
});
