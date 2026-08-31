import { getDefaultClient } from "@eaip/api";
const BASE = "/api/m9";
export async function fetchCockpit() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/executive/cockpit`);
  return r.data;
}
export async function fetchBriefing() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/executive/briefing`);
  return r.data;
}
export async function createBriefing(body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/executive/briefing`, body);
  return r.data;
}
export async function fetchDepartments() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/departments`);
  return r.data;
}
export async function fetchDepartment(id: string, industry?: string) {
  const c = getDefaultClient();
  const qs = industry ? `?industry=${industry}` : "";
  const r = await c.get(`${BASE}/departments/${id}${qs}`);
  return r.data;
}
export async function fetchKPIs(department?: string) {
  const c = getDefaultClient();
  const qs = department ? `?department=${department}` : "";
  const r = await c.get(`${BASE}/kpi${qs}`);
  return r.data;
}
export async function createKPI(body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/kpi`, body);
  return r.data;
}
export async function fetchSynthetic(enterprise: string) {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/departments/synthetic/${enterprise}`);
  return r.data;
}
