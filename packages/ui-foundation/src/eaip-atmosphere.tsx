"use client";

import { useReducedMotion } from "@eaip/motion";
import { cn } from "@eaip/core";

export interface EAIPAtmosphereProps {
  intensity?:
    | "login"
    | "dashboard"
    | "brains"
    | "brain-detail"
    | "activity"
    | "knowledge"
    | "missions"
    | "monitoring"
    | "administration";
  showParticles?: boolean;
  className?: string;
}

export function EAIPAtmosphere({
  intensity,
  showParticles = false,
  className,
}: EAIPAtmosphereProps) {
  const reduced = useReducedMotion();
  const intensityClass = intensity ? `atmo-intensity-${intensity}` : undefined;

  return (
    <div aria-hidden="true" className={cn("eaip-atmosphere", intensityClass, className)}>
      <span className="eaip-atmosphere__field eaip-atmosphere__field--a" />
      <span className="eaip-atmosphere__field eaip-atmosphere__field--b" />
      <span className="eaip-atmosphere__field eaip-atmosphere__field--c" />
      <span className="eaip-atmosphere__field eaip-atmosphere__field--d" />
      <span className="eaip-atmosphere__field eaip-atmosphere__field--e" />
      {/* Light theme layered gradient background — hidden by CSS in dark/vibe modes */}
      <span className="eaip-atmosphere--light" />
      {showParticles && !reduced ? (
        <div className="eaip-atmosphere__particles">
          {Array.from({ length: 16 }, (_, index) => (
            <span
              key={index}
              className="eaip-atmosphere__particle"
              style={{
                width: `${String(2 + (index % 4))}px`,
                height: `${String(2 + (index % 4))}px`,
                left: `${String((index * 6.25) % 100)}%`,
                top: `${String((index * 6.25 + 5) % 100)}%`,
                animationDelay: `${String(-index * 1.2)}s`,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
