"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  useMemo,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@eaip/core";
import { useReducedMotion } from "@eaip/motion";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuroraOrbState =
  | "idle"
  | "hover"
  | "thinking"
  | "executing"
  | "speaking"
  | "listening"
  | "transcribing"
  | "paused"
  | "approval"
  | "error";

export interface AuroraOrbProps {
  /** Visual/interaction state of the orb. */
  state?: AuroraOrbState;
  /** Accessible label for the button. */
  label?: string;
  /** Click handler — opens the Conductor. */
  onClick?: () => void;
  /** Whether the Conductor is currently expanded. */
  ariaExpanded?: boolean;
  /** Additional class names on the wrapper button. */
  className?: string;
  /** Diameter of the orb in pixels (default 64). */
  size?: number;
  /** Badge content (e.g. approval count). */
  badge?: number | string;
}

// ---------------------------------------------------------------------------
// WebGL2 vertex & fragment shaders
// ---------------------------------------------------------------------------

const VERT = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform float u_energy;     // 0‥1 — drives deformation & brightness
uniform float u_pulse;      // 0‥1 — listening equaliser energy
uniform vec2  u_resolution;

// --- noise helpers (simplified Perlin-like) ---
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = v_uv;
  vec2 center = vec2(0.5);
  float dist = length(uv - center);

  // Soft circular mask with feathered edge
  float radius = 0.42;
  float edge   = 0.12;
  float mask = 1.0 - smoothstep(radius - edge, radius + edge, dist);

  // --- organic deformation ---
  float t = u_time * 0.15;
  float energy = u_energy;
  float deform = fbm(uv * 3.0 + t) * 0.06 * (0.6 + energy * 0.4);
  float r = dist + deform;

  // --- aurora colour field ---
  float angle = atan(uv.y - 0.5, uv.x - 0.5);
  float n1 = fbm(vec2(angle * 1.2 + t, r * 4.0));
  float n2 = fbm(vec2(angle * 0.8 - t * 0.7, r * 3.0 + 1.0));

  // Aurora palette: blue → cyan → violet → magenta
  vec3 blue    = vec3(0.14, 0.52, 0.97);
  vec3 cyan    = vec3(0.13, 0.83, 0.94);
  vec3 violet  = vec3(0.55, 0.36, 0.97);
  vec3 magenta = vec3(0.93, 0.29, 0.60);

  float blend = n1 * 0.5 + 0.5;
  vec3 col = mix(blue, cyan, smoothstep(0.0, 0.4, blend));
  col = mix(col, violet, smoothstep(0.3, 0.7, blend));
  col = mix(col, magenta, smoothstep(0.6, 1.0, blend));

  // --- internal filaments ---
  float filament = fbm(uv * 8.0 + vec2(t * 0.5, -t * 0.3));
  filament = pow(filament, 2.5) * 1.2;
  col += filament * vec3(0.3, 0.5, 1.0) * (0.4 + energy * 0.6);

  // --- Fresnel / rim glow ---
  float rim = smoothstep(0.2, 0.45, dist);
  col += rim * vec3(0.35, 0.55, 1.0) * 0.35 * (0.8 + energy * 0.4);

  // --- specular highlight ---
  vec2 specPos = vec2(0.38, 0.35);
  float spec = 1.0 - smoothstep(0.0, 0.12, length(uv - specPos));
  spec = pow(spec, 4.0);
  col += spec * vec3(1.0) * 0.45;

  // --- listening pulse equaliser ---
  float pulse = sin(dist * 40.0 - u_time * 6.0) * 0.5 + 0.5;
  col += pulse * u_pulse * vec3(0.2, 0.6, 1.0) * 0.3;

  // --- soft outer glow ---
  float glow = exp(-dist * 3.5) * 0.25 * (0.7 + energy * 0.5);
  col += glow * vec3(0.3, 0.55, 1.0);

  // Energy brightness boost
  col *= 0.85 + energy * 0.3;

  fragColor = vec4(col, mask * (0.88 + energy * 0.12));
}`;

// ---------------------------------------------------------------------------
// CSS Fallback Aurora
// ---------------------------------------------------------------------------

function AuroraFallback({ state, size }: { state: AuroraOrbState; size: number }) {
  const animating = state !== "idle" && state !== "paused" && state !== "error";

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-full",
        "bg-gradient-to-br from-[#2563EB]/30 via-[#22D3EE]/20 to-[#8B5CF6]/30",
        animating && "animate-[aurora-pulse_4s_ease-in-out_infinite]",
      )}
      style={{ width: size, height: size }}
    >
      {/* Layered gradient blobs */}
      <div
        className={cn(
          "absolute inset-[-20%] rounded-full opacity-60",
          "bg-gradient-to-tr from-[#22D3EE]/40 via-transparent to-[#EC4899]/30",
          animating && "animate-[aurora-drift_8s_ease-in-out_infinite]",
        )}
      />
      <div
        className={cn(
          "absolute inset-[-10%] rounded-full opacity-40",
          "bg-gradient-to-bl from-[#8B5CF6]/30 via-transparent to-[#2563EB]/25",
          animating && "animate-[aurora-drift_12s_ease-in-out_infinite_reverse]",
        )}
      />
      {/* Specular dot */}
      <div className="absolute top-[28%] left-[32%] h-[18%] w-[18%] rounded-full bg-white/40 blur-[2px]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// WebGL Renderer (isolated, lazy, bounded)
// ---------------------------------------------------------------------------

function useWebGL2Supported(): boolean {
  const [supported, setSupported] = useState<boolean>(false);
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      setSupported(!!gl);
      if (gl) {
        const loseExt = gl.getExtension("WEBGL_lose_context");
        loseExt?.loseContext();
      }
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

function useAuroraWebGL(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  state: AuroraOrbState,
  reduced: boolean,
) {
  const rafRef = useRef<number>(0);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef<number>(0);
  const energyRef = useRef<number>(0);
  const targetEnergyRef = useRef<number>(0);

  // Map state → target energy
  useEffect(() => {
    const map: Record<AuroraOrbState, number> = {
      idle: 0.25,
      hover: 0.45,
      thinking: 0.7,
      executing: 0.8,
      speaking: 0.65,
      listening: 0.6,
      transcribing: 0.55,
      paused: 0.3,
      approval: 0.5,
      error: 0.4,
    };
    targetEnergyRef.current = map[state];
  }, [state]);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    glRef.current = gl;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER);
    if (!vs) return;
    gl.shaderSource(vs, VERT);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      gl.deleteShader(vs);
      return;
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fs) return;
    gl.shaderSource(fs, FRAG);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }

    gl.deleteShader(vs);
    gl.deleteShader(fs);
    programRef.current = prog;

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    startTimeRef.current = performance.now();
  }, [canvasRef]);

  const render = useCallback(
    (now: number) => {
      const gl = glRef.current;
      const prog = programRef.current;
      const canvas = canvasRef.current;
      if (!gl || !prog || !canvas) return;

      // Smooth energy interpolation
      const speed = 0.04;
      energyRef.current += (targetEnergyRef.current - energyRef.current) * speed;

      const t = (now - startTimeRef.current) / 1000;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);

      const uTime = gl.getUniformLocation(prog, "u_time");
      const uEnergy = gl.getUniformLocation(prog, "u_energy");
      const uPulse = gl.getUniformLocation(prog, "u_pulse");
      const uRes = gl.getUniformLocation(prog, "u_resolution");

      gl.uniform1f(uTime, reduced ? 0 : t);
      gl.uniform1f(uEnergy, energyRef.current);
      gl.uniform1f(uPulse, state === "listening" || state === "transcribing" ? 0.7 : 0);
      gl.uniform2f(uRes, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      rafRef.current = requestAnimationFrame(render);
    },
    [canvasRef, state, reduced],
  );

  const start = useCallback(() => {
    init();
    rafRef.current = requestAnimationFrame(render);
  }, [init, render]);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const gl = glRef.current;
    if (gl) {
      const ext = gl.getExtension("WEBGL_lose_context");
      ext?.loseContext();
      glRef.current = null;
      programRef.current = null;
    }
  }, []);

  return { start, stop };
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AuroraOrb({
  state = "idle",
  label = "Open Conductor",
  onClick,
  ariaExpanded = false,
  className,
  size = 64,
  badge,
}: AuroraOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const webgl = useWebGL2Supported();
  const [hovered, setHovered] = useState(false);

  // Effective state (fold in hover)
  const effectiveState: AuroraOrbState = useMemo(() => {
    if (state === "idle" && hovered) return "hover";
    return state;
  }, [state, hovered]);

  // Canvas resolution — bounded for performance
  const dpr = useMemo(() => {
    if (typeof window === "undefined") return 1;
    return Math.min(window.devicePixelRatio, 1.5);
  }, []);
  const canvasSize = useMemo(() => Math.min(size * dpr, 256), [size, dpr]);

  // WebGL lifecycle
  const { start, stop } = useAuroraWebGL(canvasRef, effectiveState, reduced);

  useEffect(() => {
    if (webgl && !reduced) {
      start();
      return stop;
    }
  }, [webgl, reduced, start, stop]);

  // Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
    }
  }, [canvasSize]);

  // Handlers
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onClick?.();
    },
    [onClick],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.();
      }
    },
    [onClick],
  );

  // Energy-based glow intensity
  const glowIntensity =
    effectiveState === "idle" || effectiveState === "paused"
      ? "shadow-[0_0_20px_rgba(56,189,248,0.15)]"
      : effectiveState === "error"
        ? "shadow-[0_0_20px_rgba(239,68,68,0.25)]"
        : effectiveState === "approval"
          ? "shadow-[0_0_20px_rgba(234,179,8,0.25)]"
          : "shadow-[0_0_28px_rgba(56,189,248,0.3)]";

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center rounded-full",
        "transition-all duration-300 ease-out",
        "focus-visible:ring-primary focus-visible:ring-offset-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        glowIntensity,
        hovered && "scale-105",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={label}
      aria-expanded={ariaExpanded}
      aria-haspopup="dialog"
    >
      <span className="sr-only">{label}</span>

      {/* Canvas / Fallback layer */}
      {webgl && !reduced ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 rounded-full"
          style={{ width: size, height: size }}
          aria-hidden="true"
        />
      ) : (
        <AuroraFallback state={effectiveState} size={size} />
      )}

      {/* Badge */}
      {badge != null && (
        <span className="bg-warning border-surface absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 px-1 text-[10px] font-bold text-black shadow-sm">
          {String(badge)}
        </span>
      )}
    </button>
  );
}

export default AuroraOrb;
