"use client";

/* eslint-disable @typescript-eslint/no-unnecessary-condition, jsx-a11y/label-has-associated-control */

import { useState } from "react";
import { RequireAuth, useAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, SectionTitle, Button, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";

type ProfileTab = "overview" | "preferences" | "security" | "api-tokens" | "sessions";

const tabs: { id: ProfileTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "user" },
  { id: "preferences", label: "Preferences", icon: "sliders" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "api-tokens", label: "API Tokens", icon: "key" },
  { id: "sessions", label: "Sessions", icon: "clock" },
];

const demoApiTokens = [
  { id: "t1", name: "Production API", token: "eaip_prod_••••••••••••••••", created: "2025-01-15", lastUsed: "2025-07-24", scopes: ["agents:read", "agents:write"] },
  { id: "t2", name: "Development", token: "eaip_dev_••••••••••••••••••", created: "2025-03-20", lastUsed: "2025-07-25", scopes: ["agents:read"] },
  { id: "t3", name: "CI/CD Pipeline", token: "eaip_ci_••••••••••••••••••", created: "2025-06-01", lastUsed: "2025-07-23", scopes: ["agents:write", "workflows:read"] },
];

const demoSessions = [
  { id: "s1", device: "Chrome on Windows", ip: "192.168.1.100", lastActive: "Now", current: true },
  { id: "s2", device: "Safari on macOS", ip: "10.0.0.42", lastActive: "2 hours ago", current: false },
  { id: "s3", device: "Firefox on Linux", ip: "172.16.0.55", lastActive: "3 days ago", current: false },
];

function ProfileContent() {
  const { user } = useAuth();
  const addToast = usePlatformStore((state) => state.addToast);
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [apiTokens, setApiTokens] = useState(demoApiTokens);
  const [sessions] = useState(demoSessions);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Profile"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Profile" }]}
    >
      <div className="max-w-4xl space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              User Profile
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Profile</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Manage your account, preferences, security settings, and API tokens.</p>
          </div>
        </section>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {user?.name?.charAt(0) ?? "U"}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-text">{user?.name ?? "User"}</h2>
                <p className="text-sm text-text-secondary">{user?.email ?? "user@eaip.io"}</p>
                <div className="mt-2 flex gap-2">
                  {user?.roles?.map((role) => (
                    <Badge key={role} variant={role === "admin" ? "primary" : "default"}>{role}</Badge>
                  ))}
                </div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-1 rounded-lg border border-border bg-surface p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              <EnterpriseIcon name={tab.icon as never} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <Card>
            <CardHeader>
              <SectionTitle>Account Details</SectionTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                {[
                  { label: "Full Name", value: user?.name ?? "—" },
                  { label: "Email", value: user?.email ?? "—" },
                  { label: "User ID", value: user?.id ?? "—" },
                  { label: "Roles", value: user?.roles?.join(", ") ?? "—" },
                  { label: "Member Since", value: "January 2025" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <dt className="text-sm text-text-secondary">{item.label}</dt>
                    <dd className="text-sm font-medium text-text">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <SectionTitle>Theme Preferences</SectionTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text">Dark Mode</p>
                      <p className="text-xs text-text-secondary">Toggle dark/light theme</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" defaultChecked />
                      <div className="h-5 w-9 rounded-full bg-surface-tertiary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text">Compact Mode</p>
                      <p className="text-xs text-text-secondary">Reduce spacing and font sizes</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="h-5 w-9 rounded-full bg-surface-tertiary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <SectionTitle>Notification Preferences</SectionTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Email notifications", "Push notifications", "Agent execution alerts", "System health alerts", "Weekly digest"].map((pref) => (
                    <div key={pref} className="flex items-center justify-between">
                      <p className="text-sm text-text">{pref}</p>
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" defaultChecked />
                        <div className="h-5 w-9 rounded-full bg-surface-tertiary after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <SectionTitle>Password</SectionTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                <Button onClick={() => { addToast({ type: "success", title: "Password updated" }); }}>
                  Update Password
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <SectionTitle>Two-Factor Authentication</SectionTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">2FA Status</p>
                    <p className="text-xs text-text-secondary">
                      {twoFactor ? "Two-factor authentication is enabled" : "Add an extra layer of security"}
                    </p>
                  </div>
                  <Button
                    variant={twoFactor ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => { setTwoFactor(!twoFactor); addToast({ type: "success", title: twoFactor ? "2FA disabled" : "2FA enabled" }); }}
                  >
                    {twoFactor ? "Disable" : "Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "api-tokens" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <SectionTitle>API Tokens</SectionTitle>
                <Button size="sm" onClick={() => { addToast({ type: "success", title: "New API token generated" }); }}>
                  Generate Token
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {apiTokens.map((token) => (
                  <div key={token.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-text">{token.name}</p>
                      <p className="text-xs text-text-secondary">{token.token}</p>
                      <p className="text-xs text-text-secondary">Created: {token.created} | Last used: {token.lastUsed}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {token.scopes.map((scope) => (
                          <Badge key={scope} variant="default">{scope}</Badge>
                        ))}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setApiTokens((prev) => prev.filter((t) => t.id !== token.id));
                          addToast({ type: "success", title: "Token revoked" });
                        }}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "sessions" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <SectionTitle>Active Sessions</SectionTitle>
                <Button variant="secondary" size="sm" onClick={() => { addToast({ type: "success", title: "All other sessions revoked" }); }}>
                  Revoke All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <EnterpriseIcon name="cpu" size={16} />
                      <div>
                        <p className="text-sm font-medium text-text">
                          {session.device}
                          {session.current ? (
                            <Badge variant="success" className="ml-2">Current</Badge>
                          ) : null}
                        </p>
                        <p className="text-xs text-text-secondary">
                          IP: {session.ip} • Last active: {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {!session.current ? (
                      <Button variant="secondary" size="sm" onClick={() => { addToast({ type: "success", title: "Session revoked" }); }}>
                        Revoke
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
