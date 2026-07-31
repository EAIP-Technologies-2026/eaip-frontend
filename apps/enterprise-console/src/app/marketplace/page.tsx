"use client";

/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { useState } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { Badge, SectionTitle, Button, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  installed: boolean;
  popular: boolean;
  icon: string;
}

const allIntegrations: Integration[] = [
  { id: "slack", name: "Slack", description: "Post agent notifications and summaries to Slack channels", category: "communication", installed: true, popular: true, icon: "message" },
  { id: "teams", name: "Microsoft Teams", description: "Collaborate with agents directly within Teams", category: "communication", installed: false, popular: true, icon: "message" },
  { id: "jira", name: "Jira", description: "Create and update tickets from agent workflows", category: "productivity", installed: true, popular: true, icon: "briefcase" },
  { id: "github", name: "GitHub", description: "Automate code reviews and PR management via agents", category: "devops", installed: false, popular: true, icon: "code" },
  { id: "gitlab", name: "GitLab", description: "CI/CD pipeline integration with agent orchestration", category: "devops", installed: false, popular: false, icon: "code" },
  { id: "datadog", name: "Datadog", description: "Forward agent metrics and alerts to Datadog dashboards", category: "monitoring", installed: false, popular: true, icon: "activity" },
  { id: "pagerduty", name: "PagerDuty", description: "Route critical agent alerts to on-call engineers", category: "monitoring", installed: false, popular: false, icon: "bell" },
  { id: "splunk", name: "Splunk", description: "Centralize agent logs in Splunk for analysis", category: "monitoring", installed: false, popular: false, icon: "search" },
  { id: "sentry", name: "Sentry", description: "Capture and alert on agent execution errors", category: "monitoring", installed: true, popular: true, icon: "alert" },
  { id: "notion", name: "Notion", description: "Sync knowledge articles with Notion databases", category: "productivity", installed: false, popular: false, icon: "book" },
  { id: "confluence", name: "Confluence", description: "Publish agent reports to Confluence pages", category: "productivity", installed: false, popular: false, icon: "document" },
  { id: "aws", name: "AWS", description: "Deploy and manage agents on AWS infrastructure", category: "cloud", installed: false, popular: true, icon: "cpu" },
  { id: "azure", name: "Azure", description: "Microsoft Azure cloud integration for agent deployment", category: "cloud", installed: false, popular: true, icon: "cpu" },
  { id: "gcp", name: "Google Cloud", description: "GCP integration for agent runtime and storage", category: "cloud", installed: false, popular: false, icon: "cpu" },
];

const categories = ["all", "communication", "devops", "monitoring", "productivity", "cloud"];

function MarketplaceContent() {
  const addToast = usePlatformStore((state) => state.addToast);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [integrations, setIntegrations] = useState(allIntegrations);

  const filtered = integrations.filter((i) => {
    if (category !== "all" && i.category !== category) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function toggleInstall(id: string) {
    setIntegrations((prev) => prev.map((i) => i.id === id ? { ...i, installed: !i.installed } : i));
    const integration = integrations.find((i) => i.id === id);
    addToast({
      type: "success",
      title: integration?.installed ? `${integration.name} uninstalled` : `${integration?.name} installed`,
      message: integration?.installed ? "Integration has been removed" : "Integration is ready to use",
    });
  }

  const available = integrations.length;
  const configured = integrations.filter((i) => i.installed).length;
  const active = integrations.filter((i) => i.installed).length;

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Marketplace"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Marketplace" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary-subtle/50 to-transparent blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-accent-glow/30 to-transparent blur-2xl" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-primary uppercase mb-4">
              <EnterpriseIcon name="activity" size={14} />
              Integration Hub
            </div>
            <h1 className="text-3xl font-bold text-text tracking-tight">Marketplace</h1>
            <p className="mt-3 text-base text-text-secondary max-w-2xl leading-relaxed">Discover, configure, and manage third-party integrations and enterprise connectors.</p>
          </div>
        </section>

        {/* Executive Summary Strip (Layer 2) */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <EnterpriseIcon name="box" size={16} />
            <span><strong className="text-text">{available}</strong> integrations available</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <EnterpriseIcon name="check" size={16} />
            <span><strong className="text-text">{configured}</strong> configured</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <EnterpriseIcon name="activity" size={16} />
            <span><strong className="text-text">{active}</strong> active</span>
          </div>
        </div>

        {/* Operational Workspace (Layer 3) */}
        <div className="rounded-lg border border-border bg-surface">
          {/* Workspace header */}
          <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <Input
                placeholder="Search integrations..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); }}
              />
            </div>
            <div className="flex gap-1 rounded-lg border border-border p-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => { setCategory(cat); }}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    category === cat ? "bg-primary text-text-inverse" : "text-text-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Full-width list */}
          <div className="divide-y divide-border">
            {filtered.map((integration) => (
              <div key={integration.id} className="flex items-center justify-between px-4 py-3 transition-smooth hover:bg-surface-secondary">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <EnterpriseIcon name={integration.icon as never} size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-text">{integration.name}</h3>
                    <p className="text-xs capitalize text-text-secondary">{integration.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {integration.popular ? (
                    <Badge variant="primary">Popular</Badge>
                  ) : null}
                  <Button
                    variant={integration.installed ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => { toggleInstall(integration.id); }}
                  >
                    {integration.installed ? "Uninstall" : "Install"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="p-4">
              <EmptyState
                icon="search"
                title="No integrations found"
                description="Try adjusting your search terms or category filters."
                action={
                  <Button variant="secondary" size="sm" onClick={() => { setSearch(""); setCategory("all"); }}>Clear Filters</Button>
                }
              />
            </div>
          )}
        </div>

        {/* Installed Integrations */}
        <div className="rounded-lg border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <SectionTitle>Installed Integrations</SectionTitle>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {integrations.filter((i) => i.installed).map((i) => (
                <Badge key={i.id} variant="success" className="flex items-center gap-1">
                  <EnterpriseIcon name="check" size={12} />
                  {i.name}
                </Badge>
              ))}
              {integrations.filter((i) => i.installed).length === 0 && (
                <EmptyState
                  icon="puzzle-piece"
                  title="No integrations installed"
                  description="Browse the marketplace to add integrations that extend your agents' capabilities."
                  action={
                    <Button variant="secondary" iconLeft="puzzle-piece" size="sm" onClick={() => { setCategory("all"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Browse Integrations</Button>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </EnterpriseShell>
  );
}

export default function MarketplacePage() {
  return (
    <RequireAuth>
      <MarketplaceContent />
    </RequireAuth>
  );
}
