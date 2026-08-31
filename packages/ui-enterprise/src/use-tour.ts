"use client";

import { useCallback, useEffect, useRef } from "react";
import { useTourStore } from "@eaip/state";
import type { TourState, TourStep, TourResponse } from "./tour";
import {
  startTour as apiStartTour,
  sendTourCommand,
  endTour as apiEndTour,
  getTourPreferences,
} from "./tour";

export interface UseTourOptions {
  /** Current UI theme. */
  theme?: string;
  /** Whether voice output is available. */
  voiceEnabled?: boolean;
  /** Callback to navigate to a route. */
  onNavigate?: (route: string) => void;
  /** Callback when tour narration should be spoken. */
  onNarrate?: (text: string) => void;
  /** Callback when tour state changes. */
  onStateChange?: (state: TourState) => void;
}

export interface UseTourReturn {
  /** Whether the tour invitation should be shown. */
  showInvitation: boolean;
  /** Whether a tour is currently active. */
  isTourActive: boolean;
  /** Current tour state. */
  tourState: TourState;
  /** Current tour step. */
  currentStep: TourStep | null;
  /** Current step index. */
  currentStepIndex: number;
  /** Total number of steps. */
  totalSteps: number;
  /** Current narration text. */
  narration: string;
  /** Whether the tour was previously completed. */
  tourCompleted: boolean;
  /** Target element found and ready. */
  targetFound: boolean;
  /** Start the tour. */
  acceptTour: () => Promise<void>;
  /** Dismiss the invitation. */
  dismissInvitation: () => void;
  /** Pause the tour. */
  pause: () => Promise<void>;
  /** Resume the tour. */
  resume: () => Promise<void>;
  /** Go to next step. */
  next: () => Promise<void>;
  /** Go to previous step. */
  previous: () => Promise<void>;
  /** Skip current step. */
  skip: () => Promise<void>;
  /** Stop the tour. */
  stop: () => Promise<void>;
  /** Repeat current narration. */
  repeat: () => Promise<void>;
  /** Request more detail. */
  explain: () => Promise<void>;
  /** Request simpler explanation. */
  explainSimple: () => Promise<void>;
  /** Try the current feature yourself. */
  tryMyself: () => Promise<void>;
  /** Navigate to a specific step. */
  goTo: (stepId: string) => Promise<void>;
}

const TOUR_DISMISSED_KEY = "eaip_tour_dismissed"; // retained — tour still dismissible via Copilot on demand

export function useTour(options: UseTourOptions = {}): UseTourReturn {
  const { theme = "light", voiceEnabled = false, onNavigate, onNarrate, onStateChange } = options;

  const {
    showInvitation,
    isTourActive,
    tourState,
    currentStep,
    currentStepIndex,
    totalSteps,
    narration,
    tourCompleted,
    sessionId,
    targetFound,
    setShowInvitation,
    setTourSession,
    setTourData,
    setTargetFound,
    resetTour,
  } = useTourStore();

  const mountedRef = useRef(true);
  const targetPollingRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (targetPollingRef.current) {
        window.clearTimeout(targetPollingRef.current);
      }
    };
  }, []);

  // COPILOT-NATIVE: No persistent banner — tour is now exclusively Copilot-orchestrated
  // The dashboard no longer auto-shows "Want a guided tour?" — the user asks Copilot "Give me a demo" instead.
  // Preferences are still fetched for on-demand tour state but showInvitation is never auto-enabled.
  useEffect(() => {
    if (sessionId || isTourActive) return;

    let cancelled = false;
    const check = async () => {
      try {
        const prefs = await getTourPreferences();
        if (!mountedRef.current || cancelled) return;
        setTourData({ tourCompleted: prefs.tour_completed });
        // Intentionally NOT setting showInvitation — banner removed per COPILOT-NATIVE GUIDANCE
      } catch {
        // Silently degrade
      }
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [sessionId, isTourActive, setTourData]);

  // Navigate when currentStep changes
  useEffect(() => {
    if (isTourActive && currentStep && onNavigate) {
      if (typeof window !== "undefined" && window.location.pathname !== currentStep.route) {
        onNavigate(currentStep.route);
      }
    }
  }, [currentStep, isTourActive, onNavigate]);

  // Narrate when narration changes
  useEffect(() => {
    if (isTourActive && narration && onNarrate) {
      onNarrate(narration);
    }
  }, [narration, isTourActive, onNarrate]);

  // Notify state changes
  useEffect(() => {
    onStateChange?.(tourState);
  }, [tourState, onStateChange]);

  // Bounded target element readiness detection
  useEffect(() => {
    if (!isTourActive || !currentStep) {
      setTargetFound(false);
      return;
    }

    if (targetPollingRef.current) {
      window.clearTimeout(targetPollingRef.current);
    }

    let attempts = 0;
    const maxAttempts = 30; // 3 seconds max (30 x 100ms)

    const checkTarget = () => {
      if (typeof document === "undefined") return;

      const stepId = currentStep.id.toLowerCase();
      const selectors = [
        `[data-tour="${stepId}"]`,
        `[data-tour-target="${stepId}"]`,
        `[data-tour="${currentStep.application}"]`,
        `#tour-step-${stepId}`,
        `[data-testid="${stepId}-card"]`,
        "main [role='main']",
        "#main-content",
        ".page-enter",
      ];

      let targetEl: Element | null = null;
      for (const sel of selectors) {
        targetEl = document.querySelector(sel);
        if (targetEl) break;
      }

      if (targetEl) {
        setTargetFound(true);
      } else if (attempts < maxAttempts) {
        attempts++;
        targetPollingRef.current = window.setTimeout(checkTarget, 100);
      } else {
        // Fallback gracefully without terminating tour
        setTargetFound(true);
      }
    };

    targetPollingRef.current = window.setTimeout(checkTarget, 50);

    return () => {
      if (targetPollingRef.current) {
        window.clearTimeout(targetPollingRef.current);
      }
    };
  }, [isTourActive, currentStep, setTargetFound]);

  const applyResponse = useCallback(
    (resp: TourResponse) => {
      setTourSession(resp.tour_session_id);
      setTourData({
        sessionId: resp.tour_session_id,
        tourState: resp.state,
        currentStep: resp.current_step,
        currentStepIndex: resp.current_step_index,
        totalSteps: resp.total_steps,
        narration: resp.narration,
        isTourActive:
          resp.state !== "idle" && resp.state !== "completed" && resp.state !== "cancelled",
        targetFound: false,
      });

      if (resp.state === "completed" || resp.state === "cancelled") {
        setTourSession(null);
      }
    },
    [setTourSession, setTourData],
  );

  const acceptTour = useCallback(async () => {
    setShowInvitation(false);
    try {
      const resp = await apiStartTour({ theme, voiceEnabled });
      applyResponse(resp);
    } catch {
      // Tour start failed — silently degrade
    }
  }, [theme, voiceEnabled, setShowInvitation, applyResponse]);

  const dismissInvitation = useCallback(() => {
    setShowInvitation(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(TOUR_DISMISSED_KEY, "1");
    }
    // Also persist as completed to prevent re-invitation on next visit
    void TOUR_DISMISSED_KEY;
  }, [setShowInvitation]);

  const sendCmd = useCallback(
    async (command: Parameters<typeof sendTourCommand>[1], opts?: { stepId?: string }) => {
      const activeSession = useTourStore.getState().sessionId;
      if (!activeSession) return;
      try {
        const resp = await sendTourCommand(activeSession, command, opts);
        applyResponse(resp);
      } catch {
        // Command failed — silently degrade
      }
    },
    [applyResponse],
  );

  const pause = useCallback(() => sendCmd("pause"), [sendCmd]);
  const resume = useCallback(() => sendCmd("resume"), [sendCmd]);
  const next = useCallback(() => sendCmd("next"), [sendCmd]);
  const previous = useCallback(() => sendCmd("previous"), [sendCmd]);
  const skip = useCallback(() => sendCmd("skip"), [sendCmd]);
  const repeat = useCallback(() => sendCmd("repeat"), [sendCmd]);
  const explain = useCallback(() => sendCmd("explain"), [sendCmd]);
  const explainSimple = useCallback(() => sendCmd("explain_simple"), [sendCmd]);
  const tryMyself = useCallback(() => sendCmd("try_myself"), [sendCmd]);
  const goTo = useCallback((stepId: string) => sendCmd("go_to", { stepId }), [sendCmd]);

  const stop = useCallback(async () => {
    const activeSession = useTourStore.getState().sessionId;
    if (activeSession) {
      try {
        const resp = await apiEndTour(activeSession, true);
        applyResponse(resp);
      } catch {
        // Stop failed
      }
    }
    resetTour();
  }, [applyResponse, resetTour]);

  return {
    showInvitation,
    isTourActive,
    tourState,
    currentStep: currentStep,
    currentStepIndex,
    totalSteps,
    narration,
    tourCompleted,
    targetFound,
    acceptTour,
    dismissInvitation,
    pause,
    resume,
    next,
    previous,
    skip,
    stop,
    repeat,
    explain,
    explainSimple,
    tryMyself,
    goTo,
  };
}
