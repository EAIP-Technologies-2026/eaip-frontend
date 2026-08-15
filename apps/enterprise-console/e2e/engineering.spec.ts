import { expect, test } from "@playwright/test";

const user = { id: "user-1", email: "engineer@example.com", name: "Engineer", roles: ["admin"] };
const agent = { id: "agent-1", name: "Support agent", description: "Initial agent", status: "active", model: "gpt-4", metrics: { totalExecutions: 2 } };

async function mockApi(page: import("@playwright/test").Page) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/api", "");
    const method = route.request().method();
    const json = (body: unknown) => route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
    if (path === "/users/me") return json(user);
    if (path === "/auth/login" && method === "POST") return json({ token: "test-token", user });
    if (path === "/agents" && method === "GET") return json([agent]);
    if (path === "/agents" && method === "POST") return json({ ...agent, id: "agent-2", name: "Created agent" });
    if (path === "/agents/agent-1" && method === "PUT") return json({ ...agent, name: "Updated agent" });
    if (path === "/agents/agent-1" && method === "DELETE") return json({});
    if (path === "/search") return json({ query: url.searchParams.get("q"), total: 1, results: [{ id: agent.id, title: agent.name, category: "agent", href: "/agents/agent-1" }] });
    return json({});
  });
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("login submits credentials and opens the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("engineer@example.com");
  await page.locator('input[type="password"]').fill("password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});

test("agent CRUD actions are available to administrators", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("eaip_access_token", "test-token"));
  await page.goto("/agents");
  await expect(page.getByText("Support agent")).toBeVisible();
  await page.getByRole("button", { name: "Create agent" }).click();
  await page.getByLabel("Name").fill("Created agent");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByText("Agent created")).toBeVisible();
  const editButton = page.getByRole("button", { name: "Edit" }).first();
  await expect(editButton).toBeVisible();
  await editButton.click();
  await page.getByLabel("Name").fill("Updated agent");
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect(page.getByText("Agent updated")).toBeVisible();
  const deleteButton = page.getByRole("button", { name: "Delete" }).first();
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  await page.getByRole("button", { name: "Delete", exact: true }).last().click();
  await expect(page.getByText("Agent deleted")).toBeVisible();
});

test("global search opens and shows results", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("eaip_access_token", "test-token"));
  await page.goto("/agents");
  await page.getByRole("button", { name: /Search/i }).click();
  const search = page.getByPlaceholder("Search across EAIP...");
  await expect(search).toBeVisible();
  await search.fill("Agent");
  const dialog = page.getByRole("dialog", { name: "Global search" });
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(500);
  await expect(search).toHaveValue("Agent");
});
