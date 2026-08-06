import { expect, test } from "@playwright/test";

const email = "engineer@eaip.io";
const password = "eaip-test";

test("login page renders the submit button in its idle state (no loading flash)", async ({
  page,
}) => {
  await page.goto("/login");

  const submitButton = page.getByRole("button", { name: "Sign in to Enterprise Console" });

  await expect(submitButton).toBeVisible();
  await expect(submitButton).toBeEnabled();
  await expect(submitButton).not.toHaveAttribute("aria-busy", "true");
  await expect(submitButton.locator('[class*="animate-spin"]')).toHaveCount(0);

  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("a valid login redirects to the dashboard with an active session", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in to Enterprise Console" }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(
    page.locator("#main-content").getByRole("heading", { name: "Dashboard", level: 1 }),
  ).toBeVisible();

  const token = await page.evaluate(() => localStorage.getItem("eaip_access_token"));
  expect(token).toBeTruthy();

  const sessionCookie = (await page.context().cookies()).find((c) => c.name === "eaip_session");
  expect(sessionCookie).toBeTruthy();
});

test("an invalid login shows an error and stays on the login page", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("invalid");
  await page.getByRole("button", { name: "Sign in to Enterprise Console" }).click();

  await expect(page.getByRole("alert").filter({ hasText: "Invalid credentials" })).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole("button", { name: "Sign in to Enterprise Console" })).toBeEnabled();
});
