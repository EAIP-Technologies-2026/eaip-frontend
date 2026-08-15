"use client";

import { useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { Card, CardHeader, CardContent } from "@eaip/ui-foundation";
import { Badge, SectionTitle, Button, Input, Switch } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import { getConfig } from "@eaip/config";

type SettingsTab = "general" | "security" | "notifications" | "api" | "team";

const tabs: { id: SettingsTab; label: string; icon: string }[] = [
  { id: "general", label: "General", icon: "settings" },
  { id: "security", label: "Security", icon: "shield" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "api", label: "API Configuration", icon: "key" },
  { id: "team", label: "Team", icon: "users" },
];

function SettingsContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const config = getConfig();

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Settings"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Settings" }]}
    >
      <div className="max-w-4xl space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Platform Settings
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Settings</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Configure application behavior, security policies, notifications, and API connections.</p>
          </div>
        </section>

        <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
              }`}
            >
              <EnterpriseIcon name={tab.icon as never} size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "general" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <SectionTitle>Application Information</SectionTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-border">
                  {[
                    { label: "Version", value: config.version },
                    { label: "Environment", value: config.environment },
                    { label: "API URL", value: config.apiUrl },
                    { label: "WebSocket URL", value: config.wsUrl },
                    { label: "Application URL", value: config.appUrl },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <dt className="text-sm text-text-secondary">{item.label}</dt>
                      <dd className="flex items-center gap-2 text-sm font-medium text-text">
                        {item.label === "Environment" ? (
                          <Badge variant={item.value === "production" ? "primary" : "warning"}>{item.value}</Badge>
                        ) : (
                          <code className="rounded bg-surface-tertiary px-1.5 py-0.5 text-xs">{item.value}</code>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <SectionTitle>Preferences</SectionTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">Dark Mode</p>
                    <p className="text-xs text-text-secondary">Toggle dark/light theme</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text">Reduced Motion</p>
                    <p className="text-xs text-text-secondary">Minimize animations</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <SectionTitle>Session</SectionTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">
                  Session timeout: <strong className="text-text">30 minutes</strong>
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Maximum concurrent sessions: <strong className="text-text">5</strong>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <SectionTitle>Security Policies</SectionTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Require MFA for all users", desc: "Enforce multi-factor authentication" },
                    { label: "Password expiry (90 days)", desc: "Force password rotation every 90 days" },
                    { label: "Session recording", desc: "Record all admin sessions for audit" },
                    { label: "IP allowlist", desc: "Restrict access to trusted IP ranges" },
                  ].map((policy) => (
                    <div key={policy.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text">{policy.label}</p>
                        <p className="text-xs text-text-secondary">{policy.desc}</p>
                      </div>
                      <Switch />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <SectionTitle>Notification Channels</SectionTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "In-app notifications", desc: "Display notifications in the console" },
                  { label: "Email notifications", desc: "Send notifications via email" },
                  { label: "Slack integration", desc: "Post notifications to Slack" },
                  { label: "PagerDuty alerts", desc: "Route critical alerts to PagerDuty" },
                ].map((channel) => (
                  <div key={channel.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text">{channel.label}</p>
                      <p className="text-xs text-text-secondary">{channel.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "api" && (
          <Card>
            <CardHeader>
              <SectionTitle>API Configuration</SectionTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="API Base URL" defaultValue={config.apiUrl} />
              <Input label="WebSocket URL" defaultValue={config.wsUrl} />
              <Input label="Request Timeout (ms)" defaultValue="30000" />
              <Button onClick={() => { addToast({ type: "success", title: "API configuration saved" }); }}>
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        )}

        {activeTab === "team" && (
          <Card>
            <CardHeader>
              <SectionTitle>Team Settings</SectionTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-secondary">
                Manage team members, roles, and permissions from the Administration section.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => window.location.href = "/users"}>
                  Manage Users
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = "/roles"}>
                  Manage Roles
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EnterpriseShell>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}
