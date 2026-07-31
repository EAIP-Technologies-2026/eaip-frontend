"use client";

import { useState, type SyntheticEvent } from "react";
import { Button, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { cn } from "@eaip/core";

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
  appSubtitle = "Enterprise Intelligence Operating System",
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
    <main className="relative flex min-h-screen overflow-hidden bg-atmosphere-animated">
      {/* Left Panel — Product Identity */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative">
        {/* Ambient orbs for left panel */}
        <div className="orb-glow bg-primary/10 absolute -top-32 -left-32 h-[28rem] w-[28rem]" aria-hidden="true" />
        <div className="orb-glow bg-accent-glow/15 absolute -bottom-40 -right-32 h-[32rem] w-[32rem]" aria-hidden="true" />

        <div className="relative">
          {/* Large brand mark */}
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text">{appName}</h1>
          <p className="mt-3 text-lg text-text-secondary leading-relaxed max-w-md">{appSubtitle}</p>
        </div>

        <div className="relative space-y-8">
          {/* Trust signals — prominent, not tiny */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold tracking-widest text-text-muted uppercase">Enterprise Security</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-subtle text-success">
                  <EnterpriseIcon name="shield" size={16} />
                </div>
                <span>SOC 2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                  <EnterpriseIcon name="lock" size={16} />
                </div>
                <span>End-to-End Encryption</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-subtle text-accent">
                  <EnterpriseIcon name="globe" size={16} />
                </div>
                <span>SSO & Multi-Factor Authentication</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-[11px] font-semibold tracking-widest text-text-muted uppercase">
            Enterprise Authentication & Identity Platform
          </p>
          <p className="mt-1 text-[10px] text-text-muted">
            Version 1.0.0 · All access is monitored and audited
          </p>
        </div>
      </div>

      {/* Right Panel — Authentication */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center p-6 sm:p-10 lg:p-16 relative">
        <div className="orb-glow bg-primary-subtle/20 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />

        <div className="relative w-full max-w-sm mx-auto">
          {/* Mobile-only brand (shown only on small screens) */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text">{appName}</h1>
            <p className="mt-2 text-sm text-text-secondary">{appSubtitle}</p>
          </div>

          {/* Form header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-text-secondary">Enter your credentials to access the enterprise platform.</p>
          </div>

          {/* Form — keep EXACTLY the same form fields and behavior */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEmail(event.target.value);
              }}
              placeholder="name@company.com"
              required
              autoComplete="email"
              className="w-full py-3 text-base"
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(event.target.value);
              }}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className="w-full py-3 text-base"
            />

            {/* Error message with motion system exit/enter */}
            <div
              className={cn(
                "transition-smooth overflow-hidden",
                error ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              {error ? (
                <div
                  role="alert"
                  className="rounded-md border border-danger/20 bg-danger/5 p-3 text-sm text-danger"
                >
                  {error}
                </div>
              ) : null}
            </div>

            <Button
              type="submit"
              loading={loading}
              size="lg"
              className="press-feedback w-full"
            >
              Sign in to Enterprise Console
            </Button>
          </form>

          {/* Help links */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <a href="/forgot-password" className="text-primary hover:text-primary-hover transition-smooth">Forgot password?</a>
            <a href="/support" className="text-primary hover:text-primary-hover transition-smooth">Need help?</a>
          </div>

          {/* Security footer */}
          <div className="mt-8 space-y-2 text-center">
            <p className="text-xs text-text-muted">
              This system is for authorized enterprise users only.
            </p>
            <p className="text-[10px] font-semibold tracking-widest text-text-muted uppercase">
              Enterprise Authentication & Identity Platform
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
