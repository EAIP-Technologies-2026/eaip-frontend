import { expect, test } from "@playwright/test";

const user = { id: "user-1", email: "engineer@example.com", name: "Engineer", roles: ["admin"] };
const document = { id: "document-1", title: "Runbook", content: "Initial content", tags: [], createdAt: "2026-01-01" };
const memory = { id: "memory-1", key: "timezone", value: "UTC", timestamp: "2026-01-01T00:00:00Z" };

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/api", "");
    const method = route.request().method();
    const json = (body: unknown) => route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
    if (path === "/users/me") return json(user);
    if (path === "/knowledge/documents" && method === "GET") return json([document]);
    if (path === "/knowledge/collections") return json([]);
    if (path === "/knowledge/documents" && method === "POST") return json({ ...document, id: "document-2" });
    if (path === "/knowledge/documents/document-1" && method === "DELETE") return json({});
    if (path === "/memory" && method === "GET") return json([memory]);
    if (path === "/memory/search") return json([memory]);
    if (path === "/memory/timezone" && method === "PUT") return json({});
    if (path === "/memory/timezone" && method === "DELETE") return json({});
    return json({});
  });
  await page.addInitScript(() => localStorage.setItem("eaip_access_token", "test-token"));
});

test("knowledge documents can be created and deleted", async ({ page }) => {
  await page.goto("/knowledge");
  await expect(page.getByText("Runbook")).toBeVisible();
  await page.getByRole("button", { name: /create document/i }).click();
  await page.getByLabel("Title").fill("Deployment guide");
  await page.getByLabel("Content").fill("Use the approved deployment path.");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByText("Document created")).toBeVisible();
  const deleteDocButton = page.getByRole("button", { name: "Delete" }).last();
  await expect(deleteDocButton).toBeVisible();
  await deleteDocButton.click();
  await page.getByRole("button", { name: "Delete", exact: true }).last().click();
  await expect(page.getByText("Document deleted")).toBeVisible();
});

test("memory supports create, search, and delete", async ({ page }) => {
  await page.goto("/memory");
  await expect(page.getByText("timezone")).toBeVisible();
  await page.getByRole("button", { name: "Create memory" }).click();
  await page.getByLabel("Key").fill("timezone");
  await page.getByLabel("Value (JSON or text)").fill("UTC");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByText("Memory created")).toBeVisible();
  await page.getByPlaceholder("Search memory...").fill("time");
  await expect(page.getByText("timezone")).toBeVisible();
  const deleteMemoryButton = page.getByRole("button", { name: "Delete" }).first();
  await expect(deleteMemoryButton).toBeVisible();
  await deleteMemoryButton.click();
  await page.getByRole("button", { name: "Delete", exact: true }).last().click();
  await expect(page.getByText("Memory deleted")).toBeVisible();
});
