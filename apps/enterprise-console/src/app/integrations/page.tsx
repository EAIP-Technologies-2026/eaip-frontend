"use client";

import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell, LoadingState, ErrorState } from "@eaip/ui-enterprise";
import { Button, Badge, Input, EmptyState } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import { usePlatformStore } from "@eaip/state";
import {
  fetchIntegrationServers,
  fetchIntegrationTools,
  invokeIntegrationTool,
  connectIntegrationServer,
  disconnectIntegrationServer,
  createIntegrationServer,
  deleteIntegrationServer,
  type IntegrationServer,
  type IntegrationTool,
} from "../../services/integrations-service";
import {
  fetchConnectorCapabilities,
  type ConnectorCapability,
  type ConnectorHealthReport,
} from "../../services/connector-service";

function IntegrationsContent() {
  const addToast = usePlatformStore((s) => s.addToast);
  const [servers, setServers] = useState<IntegrationServer[]>([]);
  const [tools, setTools] = useState<IntegrationTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    transport_type: "stdio",
    endpoint: "",
    command: "mock",
  });
  const [invokeResult, setInvokeResult] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<IntegrationTool | null>(null);
  const [capabilities, setCapabilities] = useState<ConnectorCapability[]>([]);
  const [_healthReports, _setHealthReports] = useState<ConnectorHealthReport[]>([]);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [showHealth, setShowHealth] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [srv, tls, caps] = await Promise.all([
        fetchIntegrationServers(),
        fetchIntegrationTools(),
        fetchConnectorCapabilities(),
      ]);
      setServers(srv.data);
      setTools(tls.data);
      setCapabilities(caps.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = servers.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.server_id.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Integrations"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Integrations" }]}
      >
        <LoadingState message="Loading integrations..." />
      </EnterpriseShell>
    );
  if (error)
    return (
      <EnterpriseShell
        appId="enterprise-console"
        pageTitle="Integrations"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Integrations" }]}
      >
        <ErrorState message={error} onRetry={() => void load()} />
      </EnterpriseShell>
    );

  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Integrations"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Integrations" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8 lg:p-10">
          <div
            className="from-primary-subtle/50 absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
              <EnterpriseIcon name="activity" size={14} /> Connector Fabric
            </div>
            <h1 className="text-text text-3xl font-bold tracking-tight">Integrations</h1>
            <p className="text-text-secondary mt-3 max-w-2xl text-base leading-relaxed">
              MCP connector fabric — STDIO and HTTP transports, credential isolation, tool
              discovery, and tenant-filtered execution.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                size="sm"
                iconLeft="plus"
                onClick={() => {
                  setShowCreate((v) => !v);
                }}
              >
                {showCreate ? "Close" : "Add connector"}
              </Button>
              <Badge variant="default">{servers.length} servers</Badge>
              <Badge variant="default">{tools.length} tools</Badge>
            </div>
          </div>
        </section>

        {showCreate ? (
          <div className="rounded-card border-border bg-surface space-y-4 border p-5">
            <h3 className="text-text font-semibold">Add connector</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                }}
              />
              <select
                value={form.transport_type}
                onChange={(e) => {
                  setForm((f) => ({ ...f, transport_type: e.target.value }));
                }}
                className="border-border bg-surface rounded-lg border px-3 py-2 text-sm"
              >
                <option value="stdio">STDIO</option>
                <option value="http">HTTP / SSE</option>
              </select>
              <Input
                placeholder="Endpoint or command (mock for synthetic)"
                value={form.transport_type === "http" ? form.endpoint : form.command}
                onChange={(e) => {
                  setForm((f) =>
                    form.transport_type === "http"
                      ? { ...f, endpoint: e.target.value }
                      : { ...f, command: e.target.value },
                  );
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowCreate(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!form.name.trim()) {
                    addToast({ type: "error", title: "Name required" });
                    return;
                  }
                  void createIntegrationServer({
                    name: form.name,
                    transport_type: form.transport_type,
                    endpoint: form.endpoint,
                    command: form.command,
                  }).then((r) => {
                    if (r.source === "fallback")
                      addToast({ type: "error", title: "Backend unavailable" });
                    else {
                      addToast({ type: "success", title: "Connector added" });
                      setShowCreate(false);
                      void load();
                    }
                  });
                }}
              >
                Create
              </Button>
            </div>
          </div>
        ) : null}

        <section>
          <div className="border-border flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 sm:max-w-sm">
              <Input
                placeholder="Search integrations..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
            </div>
            <span className="text-text-secondary text-xs">
              {filtered.length} of {servers.length}
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className="pt-6">
              <EmptyState
                icon="activity"
                title="No integrations"
                description={
                  search
                    ? "No matches."
                    : "Synthetic connectors are pre-registered. Add a connector to get started."
                }
              />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <div
                  key={s.server_id}
                  className="rounded-card border-border bg-surface hover:border-primary/40 transition-smooth border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-text line-clamp-1 text-sm font-semibold">{s.name}</h3>
                    <Badge
                      variant={
                        s.status === "connected"
                          ? "success"
                          : s.status === "error"
                            ? "danger"
                            : s.status === "disabled"
                              ? "default"
                              : "warning"
                      }
                    >
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">
                    {s.transport_type} · {s.server_id}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.capabilities.slice(0, 4).map((c) => (
                      <Badge key={c} variant="default">
                        {c}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        void connectIntegrationServer(s.server_id).then(() => void load());
                      }}
                    >
                      Connect
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        void disconnectIntegrationServer(s.server_id).then(() => void load());
                      }}
                    >
                      Disconnect
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        void deleteIntegrationServer(s.server_id).then(() => {
                          addToast({ type: "success", title: "Deleted" });
                          void load();
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-card border-border bg-surface border p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-text font-semibold">Discovered tools</h3>
            <div className="flex gap-2">
              <Button
                variant={showCapabilities ? "primary" : "secondary"}
                size="sm"
                onClick={() => {
                  setShowCapabilities((v) => !v);
                }}
              >
                Capabilities
              </Button>
              <Button
                variant={showHealth ? "primary" : "secondary"}
                size="sm"
                onClick={() => {
                  setShowHealth((v) => !v);
                }}
              >
                Health
              </Button>
            </div>
          </div>
          {tools.length === 0 ? (
            <p className="text-text-secondary text-sm">No tools discovered.</p>
          ) : (
            <div className="space-y-2">
              {tools.slice(0, 30).map((t) => (
                <div
                  key={`${t.server_id}:${t.name}`}
                  className="border-border flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div>
                    <span className="text-text text-sm font-medium">{t.name}</span>
                    <span className="text-text-secondary ml-2 text-xs">
                      {t.server_id} · {t.description.slice(0, 60)}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedTool(t);
                    }}
                  >
                    Invoke
                  </Button>
                </div>
              ))}
            </div>
          )}
          {selectedTool ? (
            <div className="border-primary/30 bg-primary/5 mt-4 rounded-lg border p-4">
              <h4 className="text-text text-sm font-semibold">
                Invoke {selectedTool.name} ({selectedTool.server_id})
              </h4>
              <div className="mt-3 flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    void invokeIntegrationTool(selectedTool.server_id, selectedTool.name, {}).then(
                      (r) => {
                        setInvokeResult(JSON.stringify(r.data, null, 2));
                      },
                    );
                  }}
                >
                  Run with empty args
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedTool(null);
                  }}
                >
                  Close
                </Button>
              </div>
              {invokeResult ? (
                <pre className="bg-surface-tertiary mt-3 max-h-64 overflow-auto rounded p-3 text-xs">
                  {invokeResult}
                </pre>
              ) : null}
            </div>
          ) : null}
        </section>

        {showCapabilities ? (
          <section className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 font-semibold">Connector Capabilities</h3>
            {capabilities.length === 0 ? (
              <p className="text-text-secondary text-sm">No capabilities registered.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {capabilities.map((cap) => (
                  <div
                    key={`${cap.tenant_id}:${cap.connector_id}`}
                    className="border-border rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-text text-sm font-semibold">{cap.connector_id}</h4>
                      <Badge variant={cap.tenant_availability ? "success" : "warning"}>
                        {cap.connector_type}
                      </Badge>
                    </div>
                    <p className="text-text-secondary mt-1 text-xs">
                      Classification: {cap.data_classification}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cap.operations.slice(0, 5).map((op) => (
                        <Badge key={op} variant="default">
                          {op}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cap.data_classes.slice(0, 3).map((dc) => (
                        <Badge key={dc} variant="default">
                          {dc}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-text-secondary mt-2 text-xs">
                      Est. latency: {cap.latency_estimate_ms}ms
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {showHealth ? (
          <section className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text mb-3 font-semibold">Connector Health</h3>
            <p className="text-text-secondary mb-3 text-sm">
              Health status is tracked per connector. Connectors in SYNTHETIC mode show as unhealthy
              until real credentials are configured.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((s) => (
                <div key={s.server_id} className="border-border rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-text text-sm font-semibold">{s.name}</h4>
                    <Badge
                      variant={
                        s.status === "connected"
                          ? "success"
                          : s.status === "error"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {s.status}
                    </Badge>
                  </div>
                  <p className="text-text-secondary mt-1 text-xs">Type: {s.transport_type}</p>
                  <p className="text-text-secondary text-xs">
                    Mode: {s.status === "connected" ? "CONNECTED" : "SYNTHETIC"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </EnterpriseShell>
  );
}

export default function IntegrationsPage() {
  return (
    <RequireAuth>
      <IntegrationsContent />
    </RequireAuth>
  );
}
