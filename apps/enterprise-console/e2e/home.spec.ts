import { test, expect } from "@playwright/test";

test("home page redirects to login", async ({ page }) => {
  await page.goto("/");
  await page.waitForURL(/\/login/, { timeout: 10000 });
  await expect(page.getByText("Enterprise Console").first()).toBeVisible();
});
