import { getDefaultClient } from "@eaip/api";
import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

// -- Digital Workforce 2.0 --
export async function fetchDigitalEmployees(
  params?: Record<string, string>,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/workforce2/employees", params);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function createDigitalEmployee(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/workforce2/employees", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function fetchWorkforceCapacity(): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get("/workforce2/capacity");
    if (r.error) throw r.error;
    return liveResult(r.data ?? {});
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
export async function matchWorkforce(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<unknown[]>("/workforce2/match", body);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function planWorkforceAssignments(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<unknown[]>("/workforce2/assignments", body);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}

// -- Methodologies --
export async function fetchMethodologies(
  params?: Record<string, string>,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/methodologies", params);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function createMethodology(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/methodologies", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function recommendMethodologies(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.post<unknown[]>("/methodologies/recommend", body);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function evaluateMethodology(
  id: string,
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/methodologies/${encodeURIComponent(id)}/evaluate`, body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}

// -- Document Intelligence --
export async function ingestDocumentIntelligence(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/documents/intelligence/ingest", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function fetchDocumentIntelligenceList(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/documents/intelligence/list");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function fetchDocumentEntities(id: string): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get(`/documents/intelligence/${encodeURIComponent(id)}/entities`);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
export async function fetchDocumentTables(id: string): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get(`/documents/intelligence/${encodeURIComponent(id)}/tables`);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
export async function validateDocument(
  id: string,
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/documents/intelligence/${encodeURIComponent(id)}/validate`, body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}

// -- Governance 2 --
export async function fetchGovernedSystems(
  params?: Record<string, string>,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/governance2/systems", params);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function createGovernedSystem(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/governance2/systems", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function assessGovernanceRisk(
  systemId: string,
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/governance2/systems/${encodeURIComponent(systemId)}/risk`, body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function fetchGovernancePolicies(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/governance2/policies");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function explainGovernance(systemId: string): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get(`/governance2/explain/${encodeURIComponent(systemId)}`);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}

// -- Simulation 2.0 / Twins / Scenarios --
export async function fetchTwins(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/simulation2/twins");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function createTwin(body: Record<string, unknown>): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/simulation2/twins", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function fetchScenarios(): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/simulation2/scenarios");
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function createScenario(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/simulation2/scenarios", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function addScenarioAlternative(
  scenarioId: string,
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(
      `/simulation2/scenarios/${encodeURIComponent(scenarioId)}/alternatives`,
      body,
    );
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function runCounterfactual(
  scenarioId: string,
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(
      `/simulation2/scenarios/${encodeURIComponent(scenarioId)}/counterfactual`,
      body,
    );
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function compareScenarios(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/simulation2/scenarios/compare", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
export async function replayScenario(scenarioId: string): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.get(`/simulation2/scenarios/${encodeURIComponent(scenarioId)}/replay`);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
export async function simulateDecision(decisionId: string): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(
      `/intelligence/decisions/${encodeURIComponent(decisionId)}/simulate`,
      {},
    );
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}

// -- Ops Intelligence --
export async function ingestOpsEvents(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/ops-intelligence/ingest", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
export async function fetchOpsInsights(
  params?: Record<string, string>,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/ops-intelligence/insights", params);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function escalateInsight(insightId: string): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(
      `/ops-intelligence/insights/${encodeURIComponent(insightId)}/escalate`,
      {},
    );
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}

// -- Improvements --
export async function fetchImprovements(
  params?: Record<string, string>,
): Promise<ServiceResult<unknown[]>> {
  try {
    const c = getDefaultClient();
    const r = await c.get<unknown[]>("/improvements", params);
    if (r.error) throw r.error;
    return liveResult(r.data ?? []);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult([], "Backend unavailable");
    throw err;
  }
}
export async function proposeImprovement(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/improvements", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function reviewImprovement(
  proposalId: string,
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/improvements/${encodeURIComponent(proposalId)}/review`, body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function applyImprovement(proposalId: string): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/improvements/${encodeURIComponent(proposalId)}/apply`, {});
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}
export async function measureImprovement(
  proposalId: string,
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post(`/improvements/${encodeURIComponent(proposalId)}/measure`, body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult(null, "Backend unavailable");
    throw err;
  }
}

// -- Wave2 pipeline --
export async function runWave2Pipeline(
  body: Record<string, unknown>,
): Promise<ServiceResult<unknown>> {
  try {
    const c = getDefaultClient();
    const r = await c.post("/wave2/pipeline/run", body);
    if (r.error) throw r.error;
    return liveResult(r.data);
  } catch (err) {
    if (isNetworkError(err)) return fallbackResult({}, "Backend unavailable");
    throw err;
  }
}
