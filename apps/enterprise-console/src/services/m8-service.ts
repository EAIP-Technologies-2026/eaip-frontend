import { getDefaultClient } from "@eaip/api";
const BASE = "/api/m8";
export async function fetchPools() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/pools`);
  return r.data;
}
export async function createPool(body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/pools`, body);
  return r.data;
}
export async function fetchWorkloads() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/workloads`);
  return r.data;
}
export async function enqueueWorkload(body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/workloads`, body);
  return r.data;
}
export async function scheduleWorkload() {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/workloads/schedule`);
  return r.data;
}
export async function fetchHAStatus() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/ha/status`);
  return r.data;
}
export async function fetchRegions() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/regions`);
  return r.data;
}
export async function createRegion(body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/regions`, body);
  return r.data;
}
export async function fetchIncidents() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/incidents`);
  return r.data;
}
export async function createIncident(body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/incidents`, body);
  return r.data;
}
export async function remediateIncident(id: string, body: Record<string, unknown>) {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/incidents/${id}/remediate`, body);
  return r.data;
}
export async function fetchOperationsCenter() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/operations/center`);
  return r.data;
}
export async function fetchCapacity() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/capacity`);
  return r.data;
}
export async function fetchResidencyPolicies() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/data-residency`);
  return r.data;
}
export async function fetchProfiles() {
  const c = getDefaultClient();
  const r = await c.get(`${BASE}/deployment-profiles`);
  return r.data;
}
export async function createBackup() {
  const c = getDefaultClient();
  const r = await c.post(`${BASE}/dr/backup`);
  return r.data;
}
