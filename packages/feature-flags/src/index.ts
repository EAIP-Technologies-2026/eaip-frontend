export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rules?: Array<{ condition: string; value: boolean }>;
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