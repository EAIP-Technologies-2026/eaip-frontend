"use client";

import { useState, type SyntheticEvent } from "react";
import { Button, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { cn } from "@eaip/core";
import { EAIPAtmosphere } from "./eaip-atmosphere";

export interface LoginShellProps {
  appName: string;
  appSubtitle?: string;
  onSubmit: (email: string, password: string) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  onClearError?: () => void;
}

export function LoginShell({
  appName,
  appSubtitle = "Enterprise Intelligence Platform",
  onSubmit,
  loading = false,
  error = null,
  onClearError,
}: LoginShellProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    onClearError?.();
    void onSubmit(email, password);
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden">
      <EAIPAtmosphere intensity="login" showParticles />

      {/* Left identity panel — desktop only */}
      <div className="relative z-10 hidden items-center justify-center px-8 lg:flex lg:w-[45%]">
        {/* Enhancement 05: Logo emergence */}
        <div className="eaip-logo-emerge text-center">
          <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary backdrop-blur-sm eaip-icon-glow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          <div className="mt-8 eaip-readiness-badge">
            <span className="eaip-readiness-dot" aria-hidden="true" />
            <span>Enterprise Intelligence Platform</span>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-muted">
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
          <div className="mb-10 text-center lg:hidden eaip-logo-emerge">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary backdrop-blur-sm eaip-icon-glow">
              <EnterpriseIcon name="layers" size={24} />
            </div>
            <p className="eaip-eyebrow mb-1">EAIP</p>
            <h1 className="text-xl font-semibold tracking-tight text-text">{appName}</h1>
            <p className="mt-1 text-sm text-text-secondary">{appSubtitle}</p>
          </div>

          {/* Reference 1: Ring Login Frame */}
          <div className="eaip-ring-wrapper ring">
            <div className="eaip-ring-container pointer-events-none absolute inset-[-20px] sm:inset-[-36px]" aria-hidden="true">
              <i style={{ "--clr": "var(--eaip-ring-clr-1, #3b82f6)" } as React.CSSProperties} className="eaip-ring-layer eaip-ring-layer--1" />
              <i style={{ "--clr": "var(--eaip-ring-clr-2, #6366f1)" } as React.CSSProperties} className="eaip-ring-layer eaip-ring-layer--2" />
              <i style={{ "--clr": "var(--eaip-ring-clr-3, #0ea5e9)" } as React.CSSProperties} className="eaip-ring-layer eaip-ring-layer--3" />
            </div>

            {/* Enhancement 02: Premium liquid-glass panel */}
            <div className="login-glass-panel login-glass-panel--v2 relative z-10 w-full p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="eaip-panel-heading">Sign in to your workspace</h2>
                <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                  Authorized enterprise access only.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(event) => { setEmail(event.target.value); }}
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
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); }}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full py-3 text-sm"
                />
                <div className={cn("overflow-hidden transition-all duration-300", error ? "max-h-24 opacity-100" : "max-h-0 opacity-0")}>
                  {error ? (
                    <div role="alert" className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
                      {error}
                    </div>
                  ) : null}
                </div>
                {/* Enhancement 07: Button micro-interaction */}
                <Button type="submit" loading={loading} size="lg" fullWidth className="shimmer-button eaip-login-btn">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs">
                <a href="/forgot-password" className="text-text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
                  Forgot password?
                </a>
                <a href="/support" className="text-text-muted transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
                  Need help?
                </a>
              </div>
              <div className="mt-8 border-t border-border/50 pt-6 text-center">
                <p className="text-[11px] text-text-muted">
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
                  <feColorMatrix values="
                      1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -10" />
                </filter>
              </defs>
            </svg>

            <div className="space-y-1.5">
              <p className="text-base font-semibold tracking-tight text-text">
                Signing in to EAIP
              </p>
              <p className="text-xs text-text-secondary">
                Establishing secure enterprise session...
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
