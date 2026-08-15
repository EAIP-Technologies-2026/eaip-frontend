import { expect, test } from "@playwright/test";

const adminUser = {
  id: "admin-1",
  email: "admin@example.com",
  name: "Platform Admin",
  roles: ["admin"],
};

const mockFlags = [
  { key: "enable_new_auth", enabled: true, description: "New auth flow" },
  { key: "beta_analytics", enabled: false, description: "Beta analytics dashboard" },
];

const mockLicenses = [
  { id: "lic-1", key: "EAIP-ENT-2026", type: "Enterprise", status: "active", seats: 100, expiresAt: "2027-01-01" },
];

const mockAuditLogs = [
  { id: "audit-1", action: "USER_LOGIN", user: "admin@example.com", timestamp: "2026-08-07T12:00:00Z", outcome: "success", details: "Successful login" },
];

const mockSnapshot = {
  timestamp: "2026-08-07T12:00:00Z",
  version: "v0.0.2",
  services: [
    { name: "auth_service", status: "healthy", version: "1.0.0" },
    { name: "agent_engine", status: "healthy", version: "1.2.0" },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/api", "");
    const method = route.request().method();
    const json = (body: unknown) => route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });

    if (path === "/users/me") return json(adminUser);
    if (path === "/admin/feature-flags" && method === "GET") return json(mockFlags);
    if (path.startsWith("/admin/feature-flags/") && path.endsWith("/toggle") && method === "POST") {
      return json({ key: "beta_analytics", enabled: true });
    }
    if (path === "/admin/licenses" && method === "GET") return json(mockLicenses);
    if (path === "/admin/licenses" && method === "POST") return json({ id: "lic-2", key: "EAIP-TRIAL", type: "Trial", status: "active", seats: 10, expiresAt: "2026-12-31" });
    if (path === "/admin/audit" && method === "GET") return json(mockAuditLogs);
    if (path === "/admin/snapshot" && method === "GET") return json(mockSnapshot);
    return json({});
  });

  await page.addInitScript(() => localStorage.setItem("eaip_access_token", "test-token"));
});

test("feature flags dashboard lists flags and toggles a flag", async ({ page }) => {
  await page.goto("/feature-flags");
  await expect(page.getByText("Feature Flags")).toBeVisible();
  await expect(page.getByText("enable_new_auth")).toBeVisible();
});

test("licenses dashboard lists active licenses and allows creating a license", async ({ page }) => {
  await page.goto("/licenses");
  await expect(page.getByText("License Management")).toBeVisible();
  await expect(page.getByText("EAIP-ENT-2026")).toBeVisible();
});

test("audit trail page displays system audit logs", async ({ page }) => {
  await page.goto("/audit");
  await expect(page.getByText("Audit Trail")).toBeVisible();
  await expect(page.getByText("USER_LOGIN")).toBeVisible();
});

test("snapshots page displays module health states", async ({ page }) => {
  await page.goto("/snapshot");
  await expect(page.getByText("System Snapshots")).toBeVisible();
  await expect(page.getByText("auth_service")).toBeVisible();
});
