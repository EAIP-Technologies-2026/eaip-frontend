import type { ServiceResult } from "./service-result";
import { liveResult, fallbackResult, isNetworkError } from "./service-result";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  department?: string;
  lastActive?: string;
  status: "active" | "inactive" | "suspended";
}

const demoUsers: AdminUser[] = [
  { id: "u1", name: "Alex Rivera", email: "alex.rivera@eaip.io", roles: ["admin"], department: "Engineering", lastActive: new Date().toISOString(), status: "active" },
  { id: "u2", name: "Sam Chen", email: "sam.chen@eaip.io", roles: ["operator", "developer"], department: "Operations", lastActive: new Date(Date.now() - 3600000).toISOString(), status: "active" },
  { id: "u3", name: "Jordan Patel", email: "jordan.patel@eaip.io", roles: ["operator"], department: "Operations", lastActive: new Date(Date.now() - 7200000).toISOString(), status: "active" },
  { id: "u4", name: "Morgan Lee", email: "morgan.lee@eaip.io", roles: ["viewer"], department: "Product", lastActive: new Date(Date.now() - 86400000).toISOString(), status: "inactive" },
  { id: "u5", name: "Casey Kim", email: "casey.kim@eaip.io", roles: ["developer"], department: "Engineering", lastActive: new Date(Date.now() - 1800000).toISOString(), status: "active" },
];

export async function fetchAdminUsers(): Promise<ServiceResult<AdminUser[]>> {
  try {
    const { getDefaultClient } = await import("@eaip/api");
    const client = getDefaultClient();
    const response = await client.get<{ items: AdminUser[]; total: number }>("/users");
    if (response.error) throw response.error;
    return liveResult(response.data?.items ?? []);
  } catch (err) {
    if (isNetworkError(err)) {
      return fallbackResult(demoUsers, "Backend unavailable");
    }
    throw err;
  }
}
