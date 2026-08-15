import { getDefaultClient, type ApiClient } from "@eaip/api";

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rules?: { condition: string; value: boolean }[];
}

const flags = new Map<string, FeatureFlag>();

export function registerFlag(flag: FeatureFlag): void {
  flags.set(flag.key, flag);
}

export function isEnabled(key: string, _context?: Record<string, unknown>): boolean {
  const flag = flags.get(key);
  if (!flag) return false;
  if (flag.rules) {
    for (const rule of flag.rules) {
      if (rule.condition === "always") return rule.value;
    }
  }
  return flag.enabled;
}

export function setEnabled(key: string, enabled: boolean): void {
  const flag = flags.get(key);
  if (flag) {
    flags.set(key, { ...flag, enabled });
  }
}

// ---------------------------------------------------------------------------
// API Feature Flags Client Implementation
// ---------------------------------------------------------------------------

export interface FeatureFlagClient {
  listFlags(): Promise<{ name: string; enabled: boolean }[]>;
  toggleFlag(name: string): Promise<{ name: string; enabled: boolean }>;
}

export class ApiFeatureFlagClient implements FeatureFlagClient {
  private client: ApiClient;

  constructor(client?: ApiClient) {
    this.client = client ?? getDefaultClient();
  }

  async listFlags(): Promise<{ name: string; enabled: boolean }[]> {
    const response = await this.client.get<{ flags: { name: string; enabled: boolean }[] }>("/admin/feature-flags");
    if (response.error) throw response.error;
    return response.data?.flags ?? [];
  }

  async toggleFlag(name: string): Promise<{ name: string; enabled: boolean }> {
    const response = await this.client.post<{ name: string; enabled: boolean }>(`/admin/feature-flags/${name}/toggle`, {});
    if (response.error) throw response.error;
    if (!response.data) throw new Error(`Empty response on toggle of feature flag ${name}`);
    return response.data;
  }
}

export function createFeatureFlagClient(client?: ApiClient): FeatureFlagClient {
  return new ApiFeatureFlagClient(client);
}
