"use client";
import { useState, useEffect, useCallback } from "react";
import { RequireAuth } from "@eaip/auth";
import { EnterpriseShell } from "@eaip/ui-enterprise";
import { Button, Badge, Input } from "@eaip/ui-primitives";
import { EnterpriseIcon } from "@eaip/icons";
import {
  createLoop,
  fetchLoops,
  advanceLoop,
  approveLoop,
  checkAutonomy,
  createObjective,
  runScenario,
  fetchControlPlane,
} from "../../services/m10-service";

function LoopContent() {
  const [loops, setLoops] = useState<unknown[]>([]);
  const [objective, setObjective] = useState("Increase customer retention by 10%");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [cp, setCp] = useState<Record<string, unknown> | null>(null);
  const load = useCallback(async () => {
    try {
      const [l, c] = await Promise.all([
        fetchLoops().catch(() => []),
        fetchControlPlane().catch(() => null),
      ]);
      setLoops(Array.isArray(l) ? l : []);
      setCp(c as Record<string, unknown>);
    } catch {
      /* */
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <EnterpriseShell
      appId="enterprise-console"
      pageTitle="Enterprise Loop"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Enterprise Loop" }]}
    >
      <div className="space-y-8">
        <section className="surface-hero relative overflow-hidden p-8">
          <div className="text-primary mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase">
            <EnterpriseIcon name="activity" size={14} />
            M10 Autonomous Enterprise Loop — CAPSTONE
          </div>
          <h1 className="text-text text-3xl font-bold tracking-tight">Enterprise Loop</h1>
          <p className="text-text-secondary mt-3 max-w-3xl text-sm">
            OBSERVE → UNDERSTAND → REMEMBER → CONTEXTUALIZE → DETECT → PREDICT → REASON → DECIDE →
            GOVERN → PLAN → SIMULATE → DELEGATE → EXECUTE → OBSERVE OUTCOME → VERIFY → LEARN →
            IMPROVE → PROPOSE STRATEGIC UPDATE → REPEAT — bounded, tenant-scoped, auditable
          </p>
        </section>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text font-semibold">Start Master Loop</h3>
            <div className="mt-3 flex gap-2">
              <Input
                value={objective}
                onChange={(e) => {
                  setObjective(e.target.value);
                }}
                placeholder="Enterprise objective"
              />
              <Button
                size="sm"
                onClick={() => {
                  void (async () => {
                    const r = await createLoop({ objective, autonomy_level: "L2" });
                    void load();
                    setSelected(r as Record<string, unknown>);
                  })();
                }}
              >
                Start
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void (async () => {
                    const r = await createObjective({ objective });
                    void load();
                    setSelected(r as Record<string, unknown>);
                  })();
                }}
              >
                Objective Loop
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void (async () => {
                    const r = await runScenario("apex-customer-intelligence");
                    void load();
                    setSelected(r as Record<string, unknown>);
                  })();
                }}
              >
                Apex Scenario
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void (async () => {
                    const r = await runScenario("nova-production");
                    void load();
                    setSelected(r as Record<string, unknown>);
                  })();
                }}
              >
                Nova Scenario
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void (async () => {
                    const r = await runScenario("meridian-healthcare");
                    void load();
                    setSelected(r as Record<string, unknown>);
                  })();
                }}
              >
                Meridian Scenario
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {loops.slice(0, 5).map((l: unknown) => {
                const x = l as Record<string, unknown>;
                return (
                  <div
                    key={String(x.run_id)}
                    className="border-border flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <span className="truncate">{String(x.objective).slice(0, 40)}</span>
                    <Badge variant="default">
                      {String(x.current_phase)} · {String(x.status)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelected(x as Record<string, unknown>)}
                    >
                      View
                    </Button>
                  </div>
                );
              })}
              {loops.length === 0 && <p className="text-text-muted text-sm">No loops yet</p>}
            </div>
          </div>
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text font-semibold">Loop Detail & Control</h3>
            {selected ? (
              <div className="space-y-3">
                <pre className="bg-surface-tertiary overflow-auto rounded p-3 text-xs">
                  {JSON.stringify(selected, null, 2).slice(0, 2500)}
                </pre>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      void (async () => {
                        const r = await advanceLoop(
                          (selected.run_id ?? selected.loop_id ?? "") as string,
                        );
                        setSelected(r as Record<string, unknown>);
                        void load();
                      })();
                    }}
                  >
                    Advance Phase
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void (async () => {
                        const r = await approveLoop((selected.run_id ?? "") as string, {
                          approver: "test",
                        });
                        setSelected(r as Record<string, unknown>);
                        void load();
                      })();
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void (async () => {
                        const r = await checkAutonomy((selected.run_id ?? "") as string, {
                          risk: "high",
                          cost: 5000,
                        });
                        setSelected(r as Record<string, unknown>);
                      })();
                    }}
                  >
                    Check Autonomy (high risk)
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-text-muted mt-4 text-sm">Select or create a loop</p>
            )}
          </div>
        </div>
        {cp ? (
          <div className="rounded-card border-border bg-surface border p-5">
            <h3 className="text-text font-semibold">Control Plane</h3>
            <pre className="bg-surface-tertiary mt-3 overflow-auto rounded p-3 text-xs">
              {JSON.stringify(cp, null, 2).slice(0, 3000)}
            </pre>
          </div>
        ) : null}
      </div>
    </EnterpriseShell>
  );
}
export default function EnterpriseLoopPage() {
  return (
    <RequireAuth>
      <LoopContent />
    </RequireAuth>
  );
}
