/**
 * Governed Speech Input and Speech Output Abstractions for EAIP Conductor (Phase 2).
 */

export type VoiceState =
  | "idle"
  | "listening"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error";

export type PermissionState = "prompt" | "granted" | "denied" | "unsupported";

export interface SpeechInputConfig {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: VoiceState) => void;
}

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultLike
  extends ArrayLike<SpeechRecognitionResultItem> {
  isFinal?: boolean;
}

interface SpeechRecognitionResultEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export class SpeechInputService {
  private recognition: SpeechRecognitionLike | null = null;
  private isListening = false;

  constructor(private config: SpeechInputConfig = {}) {
    if (typeof window !== "undefined") {
      const w = window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      };
      const SpeechRecognition = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = "en-US";

        this.recognition.onstart = () => {
          this.isListening = true;
          this.config.onStateChange?.("listening");
        };

        this.recognition.onresult = (event) => {
          let transcript = "";
          let isFinal = false;
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            if (!result) continue;
            const item = result[0];
            transcript += item ? item.transcript : "";
            if (result.isFinal) {
              isFinal = true;
            }
          }
          this.config.onStateChange?.(isFinal ? "transcribing" : "listening");
          this.config.onTranscript?.(transcript, isFinal);
        };

        this.recognition.onerror = (event) => {
          this.isListening = false;
          this.config.onStateChange?.("error");
          this.config.onError?.(event.error || "Speech recognition error");
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.config.onStateChange?.("idle");
        };
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public start(): void {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to start listening";
        this.config.onError?.(message);
      }
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore stop errors
      }
    }
  }

  public cancel(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore abort errors
      }
    }
  }
}

export class SpeechOutputService {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return this.synth !== null;
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!this.synth) return;
    this.cancel();

    // Voice concise formatting: remove lengthy JSON strings or code blocks
    const conciseText = text
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/\{[\s\S]*?\}/g, "Data summary ready.")
      .slice(0, 200);

    const utterance = new SpeechSynthesisUtterance(conciseText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    this.synth.speak(utterance);
  }

  public cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
