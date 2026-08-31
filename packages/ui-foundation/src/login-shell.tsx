"use client";

import { useState, type SyntheticEvent } from "react";
import { Button, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { cn } from "@eaip/core";
import { EAIPAtmosphere } from "./eaip-atmosphere";

export interface LoginWorkspace {
  id: string;
  label: string;
}

export interface LoginShellProps {
  appName: string;
  appSubtitle?: string;
  onSubmit: (email: string, password: string, workspaceId?: string) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  workspaces?: LoginWorkspace[];
  defaultWorkspace?: string;
}

export function LoginShell({
  appName,
  appSubtitle = "Enterprise Intelligence Platform",
  onSubmit,
  loading = false,
  error = null,
  onClearError,
  workspaces,
  defaultWorkspace,
}: LoginShellProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState(defaultWorkspace ?? workspaces?.[0]?.id);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    onClearError?.();
    const form = event.currentTarget;
    const emailEl = form.querySelector<HTMLInputElement>(
      "input#email, input[type='email'], input[name='email']",
    );
    const passwordEl = form.querySelector<HTMLInputElement>(
      "input#password, input[type='password'], input[name='password']",
    );
    const finalEmail = (emailEl?.value ?? email).trim();
    const finalPassword = (passwordEl?.value ?? password).trim();
    void onSubmit(finalEmail, finalPassword, workspace);
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden">
      <EAIPAtmosphere intensity="login" showParticles />

      {/* Left identity panel — desktop only */}
      <div className="relative z-10 hidden items-center justify-center px-8 lg:flex lg:w-[45%]">
        {/* Enhancement 05: Logo emergence */}
        <div className="eaip-logo-emerge text-center">
          <div className="border-primary/20 bg-primary/10 text-primary eaip-icon-glow mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border backdrop-blur-sm">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          {/* Enhancement 10: Enterprise intelligence typography */}
          <p className="eaip-eyebrow mb-2">EAIP</p>
          <h1 className="eaip-wordmark">{appName}</h1>
          <p className="eaip-subtitle mt-2">{appSubtitle}</p>
          {/* Enhancement 08: Honest static readiness badge */}
          <div className="eaip-readiness-badge mt-8">
            <span className="eaip-readiness-dot" aria-hidden="true" />
            <span>Enterprise Intelligence Platform</span>
          </div>
          <div className="text-text-muted mt-8 flex items-center justify-center gap-2 text-xs">
            <EnterpriseIcon name="shield" size={14} className="text-success" />
            <span>SOC 2 Type II</span>
            <span className="text-border">·</span>
            <EnterpriseIcon name="lock" size={14} className="text-primary" />
            <span>E2E Encrypted</span>
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="relative z-10 flex w-full flex-col justify-center p-6 sm:p-10 lg:w-[55%] lg:p-16">
        {/* Enhancement 06: Card entrance — fade + slide + blur */}
        <div className="login-panel-enter mx-auto w-full max-w-md">
          {/* Mobile identity */}
          <div className="eaip-logo-emerge mb-10 text-center lg:hidden">
            <div className="border-primary/20 bg-primary/10 text-primary eaip-icon-glow mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur-sm">
              <EnterpriseIcon name="layers" size={24} />
            </div>
            <p className="eaip-eyebrow mb-1">EAIP</p>
            <h1 className="text-text text-xl font-semibold tracking-tight">{appName}</h1>
            <p className="text-text-secondary mt-1 text-sm">{appSubtitle}</p>
          </div>

          {/* Reference 1: Ring Login Frame */}
          <div className="eaip-ring-wrapper ring">
            <div
              className="eaip-ring-container pointer-events-none absolute inset-[-20px] sm:inset-[-36px]"
              aria-hidden="true"
            >
              <i
                style={{ "--clr": "var(--eaip-ring-clr-1, #3b82f6)" } as React.CSSProperties}
                className="eaip-ring-layer eaip-ring-layer--1"
              />
              <i
                style={{ "--clr": "var(--eaip-ring-clr-2, #6366f1)" } as React.CSSProperties}
                className="eaip-ring-layer eaip-ring-layer--2"
              />
              <i
                style={{ "--clr": "var(--eaip-ring-clr-3, #0ea5e9)" } as React.CSSProperties}
                className="eaip-ring-layer eaip-ring-layer--3"
              />
            </div>

            {/* Enhancement 02: Premium liquid-glass panel */}
            <div className="login-glass-panel login-glass-panel--v2 relative z-10 w-full p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="eaip-panel-heading">Sign in to your workspace</h2>
                <p className="text-text-secondary mt-1 text-sm leading-relaxed">
                  Authorized enterprise access only.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  defaultValue=""
                  onChange={(event) => {
                    setEmail(event.target.value);
                  }}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  className="w-full py-3 text-sm"
                />
                <Input
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  defaultValue=""
                  onChange={(event) => {
                    setPassword(event.target.value);
                  }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full py-3 text-sm"
                />
                {workspaces && workspaces.length > 0 ? (
                  <div>
                    <span className="text-text-secondary mb-1.5 block text-xs font-medium">
                      Workspace
                    </span>
                    <div
                      role="radiogroup"
                      aria-label="Workspace"
                      className="grid grid-cols-3 gap-2"
                    >
                      {workspaces.map((ws) => (
                        <button
                          key={ws.id}
                          type="button"
                          role="radio"
                          aria-checked={workspace === ws.id}
                          onClick={() => {
                            setWorkspace(ws.id);
                          }}
                          className={cn(
                            "rounded-lg border px-2 py-2 text-xs font-medium transition-colors",
                            workspace === ws.id
                              ? "border-primary/60 bg-primary/10 text-primary"
                              : "border-border bg-surface/40 text-text-secondary hover:border-primary/30 hover:text-text",
                          )}
                        >
                          {ws.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    error ? "max-h-24 opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  {error ? (
                    <div
                      role="alert"
                      className="border-danger/20 bg-danger/5 text-danger rounded-lg border p-3 text-sm"
                    >
                      {error}
                    </div>
                  ) : null}
                </div>
                {/* Enhancement 07: Button micro-interaction */}
                <Button
                  type="submit"
                  loading={loading}
                  size="lg"
                  fullWidth
                  className="shimmer-button eaip-login-btn"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs">
                <a
                  href="/forgot-password"
                  className="text-text-muted hover:text-primary focus-visible:ring-primary/50 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  Forgot password?
                </a>
                <a
                  href="/support"
                  className="text-text-muted hover:text-primary focus-visible:ring-primary/50 rounded transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  Need help?
                </a>
              </div>
              <div className="border-border/50 mt-8 border-t pt-6 text-center">
                <p className="text-text-muted text-[11px]">
                  All activity is monitored and logged in accordance with enterprise policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reference 2: Cinematic Gooey Authentication Loading State */}
      {loading ? (
        <div
          className="loader loader--fullscreen eaip-auth-loading-overlay fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="eaip-auth-loading-backdrop absolute inset-0 backdrop-blur-xl" />

          <div className="eaip-auth-loading-content relative z-10 flex flex-col items-center text-center">
            <div className="loader__balls eaip-gooey-wrapper mb-6">
              <div className="loader__balls__dot eaip-gooey-dot eaip-gooey-dot--1" />
              <div className="loader__balls__dot eaip-gooey-dot eaip-gooey-dot--2" />
            </div>

            <svg className="sr-only" aria-hidden="true" width="0" height="0">
              <defs>
                <filter id="gooey">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="10" />
                  <feColorMatrix
                    values="
                      1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -10"
                  />
                </filter>
              </defs>
            </svg>

            <div className="space-y-1.5">
              <p className="text-text text-base font-semibold tracking-tight">Signing in to EAIP</p>
              <p className="text-text-secondary text-xs">
                Establishing secure enterprise session...
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
