import { getDefaultClient } from "@eaip/api";

const BASE = "/api/m7";

export async function fetchArtifacts(params?: { artifact_type?: string; search?: string }) {
  const client = getDefaultClient();
  const qs = new URLSearchParams();
  if (params?.artifact_type) qs.set("artifact_type", params.artifact_type);
  if (params?.search) qs.set("search", params.search);
  const res = await client.get(`${BASE}/marketplace/artifacts?${qs.toString()}`);
  return res.data as unknown[];
}
export async function createArtifact(body: Record<string, unknown>) {
  const client = getDefaultClient();
  const res = await client.post(`${BASE}/marketplace/artifacts`, body);
  return res.data;
}
export async function verifyArtifact(artifactId: string) {
  const client = getDefaultClient();
  const res = await client.get(`${BASE}/marketplace/artifacts/${artifactId}/verify`);
  return res.data;
}
export async function sandboxInstall(artifactId: string) {
  const client = getDefaultClient();
  const res = await client.post(`${BASE}/marketplace/artifacts/${artifactId}/sandbox-install`);
  return res.data;
}
export async function fetchDeploymentPacks() {
  const client = getDefaultClient();
  const res = await client.get(`${BASE}/deployment/packs`);
  return res.data as unknown[];
}
export async function createDeploymentPack(body: Record<string, unknown>) {
  const client = getDefaultClient();
  const res = await client.post(`${BASE}/deployment/packs`, body);
  return res.data;
}
export async function fetchDeploymentConfigs() {
  const client = getDefaultClient();
  const res = await client.get(`${BASE}/deployment/configs`);
  return res.data as unknown[];
}
export async function createDeploymentConfig(body: Record<string, unknown>) {
  const client = getDefaultClient();
  const res = await client.post(`${BASE}/deployment/configs`, body);
  return res.data;
}
export async function validateDeploymentConfig(configId: string) {
  const client = getDefaultClient();
  const res = await client.post(`${BASE}/deployment/configs/${configId}/validate`);
  return res.data;
}
export async function fetchOnboardingSessions() {
  const client = getDefaultClient();
  const res = await client.get(`${BASE}/deployment/onboarding`);
  return res.data as unknown[];
}
export async function createOnboardingSession(body: Record<string, unknown>) {
  const client = getDefaultClient();
  const res = await client.post(`${BASE}/deployment/onboarding`, body);
  return res.data;
}
export async function advanceOnboarding(sessionId: string, body?: Record<string, unknown>) {
  const client = getDefaultClient();
  const res = await client.post(`${BASE}/deployment/onboarding/${sessionId}/advance`, body ?? {});
  return res.data;
}
