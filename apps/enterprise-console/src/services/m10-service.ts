import { getDefaultClient } from "@eaip/api";
const BASE = "/api/m10";
export async function createLoop(body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/loop`, body);
  return r.data;
}
export async function fetchLoops() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/loop`);
  return r.data;
}
export async function fetchLoop(id: string) {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/loop/${id}`);
  return r.data;
}
export async function advanceLoop(id: string, body?: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/loop/${id}/advance`, body ?? {});
  return r.data;
}
export async function approveLoop(id: string, body?: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/loop/${id}/approve`, body ?? {});
  return r.data;
}
export async function checkAutonomy(id: string, body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/loop/${id}/check-autonomy`, body);
  return r.data;
}
export async function createObjective(body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/objective`, body);
  return r.data;
}
export async function fetchObjectives() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/objective`);
  return r.data;
}
export async function runScenario(id: string) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/scenarios/${id}/run`);
  return r.data;
}
export async function fetchControlPlane() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/control-plane`);
  return r.data;
}
export async function fetchProof(id: string) {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/loop/${id}/proof`);
  return r.data;
}
