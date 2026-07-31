import { expect, test } from "@playwright/test";

const user = { id: "user-1", email: "engineer@example.com", name: "Engineer", roles: ["admin"] };
const workflow = { id: "workflow-1", name: "Incident workflow", description: "Initial workflow", status: "active", steps: [] };

test.beforeEach(async ({ page }) => {
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname.replace("/api", "");
    const method = route.request().method();
    const json = (body: unknown) => route.fulfill({ contentType: "application/json", body: JSON.stringify(body) });
    if (path === "/users/me") return json(user);
    if (path === "/workflows" && method === "GET") return json([workflow]);
    if (path === "/workflows" && method === "POST") return json({ ...workflow, id: "workflow-2" });
    if (path === "/workflows/workflow-1" && method === "PUT") return json(workflow);
    if (path === "/workflows/workflow-1" && method === "DELETE") return json({});
    return json({});
  });
  await page.addInitScript(() => localStorage.setItem("eaip_access_token", "test-token"));
});

test("workflow CRUD is available from the workflows page", async ({ page }) => {
  await page.goto("/workflows");
  await expect(page.getByText("Incident workflow")).toBeVisible();
  await page.getByRole("button", { name: "Create workflow" }).click();
  await page.getByLabel("Name").fill("New workflow");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByText("Workflow created")).toBeVisible();
  const editButton = page.getByRole("button", { name: "Edit" }).first();
  await expect(editButton).toBeVisible();
  await editButton.click();
  await page.getByLabel("Name").fill("Updated workflow");
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect(page.getByText("Workflow updated")).toBeVisible();
  const deleteButton = page.getByRole("button", { name: "Delete" }).first();
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  await page.getByRole("button", { name: "Delete", exact: true }).last().click();
  await expect(page.getByText("Workflow deleted")).toBeVisible();
});
