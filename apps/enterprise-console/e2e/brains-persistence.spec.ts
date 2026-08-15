import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test("brain persistence survives page reload", async ({ page }) => {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  const emailInput = page.locator('input[name="email"], input[type="email"], input[id="email"]');
  await emailInput.waitFor({ state: "visible", timeout: 10000 });
  await emailInput.fill("browser-test@eaip.dev");
  await page.locator('input[name="password"], input[type="password"]').fill("testpassword");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForFunction(() => Boolean(localStorage.getItem("eaip_access_token")));
  await page.waitForURL(/\/dashboard/);
  await page.goto(`${BASE}/brains`, { waitUntil: "networkidle" });
  const createButton = page.getByRole("button", { name: "Create a Brain" });
  await expect(createButton).toBeVisible();
  await createButton.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Create Brain", exact: true }).click();
  await page.waitForURL(/\/brains\/[^/]+$/);
  const brainUrl = page.url();
  const brainId = new URL(brainUrl).pathname.split("/").pop();
  expect(brainId).toBeTruthy();
  await expect(page.getByRole("heading", { name: /Brain/ }).first()).toBeVisible();

  await page.reload({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(brainUrl);
  await expect(page.getByRole("heading", { name: /Brain/ }).first()).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("eaip_access_token") ? "present" : "absent")).toBe("present");
});
