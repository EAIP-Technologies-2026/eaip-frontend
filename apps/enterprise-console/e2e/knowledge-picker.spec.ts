import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

async function loginAndCreateBrain(page: import("@playwright/test").Page) {
  await page.goto(BASE);
  await page.waitForTimeout(2000);

  const emailInput = page.locator(
    'input[name="email"], input[type="email"], input[id="email"]',
  );
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill("browser-knowledge@eaip.dev");
    await page
      .locator('input[name="password"], input[type="password"]')
      .fill("testpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForFunction(() => Boolean(localStorage.getItem("eaip_access_token")));
    await page.waitForURL(/\/dashboard/);
  }

  await page.goto(`${BASE}/brains`, { waitUntil: "networkidle" });
  const sidebarToggle = page.locator('button[aria-label="Toggle sidebar"]');
  if (await sidebarToggle.isVisible({ timeout: 1000 }).catch(() => false)) {
    await sidebarToggle.click();
  }
  const createBtn = page.getByRole("button", { name: "Create a Brain" });
  await createBtn.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Create Brain" }).waitFor({ state: "visible" });
  await dialog.getByRole("button", { name: "Create Brain", exact: true }).click();
  await page.waitForURL(/\/brains\/[^/]+$/);
}

test.describe("Knowledge Source Picker", () => {
  test("full knowledge picker flow at 1440x900", async ({ page }) => {
    page.setViewportSize({ width: 1440, height: 900 });
    await loginAndCreateBrain(page);

    await expect(page).toHaveURL(/\/brains\//);

    // Verify Knowledge Sources section heading
    const heading = page.getByRole("heading", { name: "Knowledge Sources", exact: true });
    await expect(heading).toBeVisible({ timeout: 5000 });

    // Click Add Knowledge
    const addBtn = page.locator('button:has-text("Add Knowledge")').first();
    await expect(addBtn).toBeVisible({ timeout: 3000 });
    await addBtn.click();

    // Verify dialog opens
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog).toContainText("Add Knowledge Sources");

    // Wait for collections to load
    await page.waitForTimeout(2000);

    // Search functionality
    const searchInput = dialog.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill("test");
      await page.waitForTimeout(500);
      await searchInput.fill("");
      await page.waitForTimeout(500);
    }

    // Select a source if available
    const sourceButtons = dialog.locator('[role="option"]');
    const count = await sourceButtons.count();
    if (count > 0) {
      await sourceButtons.first().click();
      await page.waitForTimeout(300);
      if (count > 1) {
        await sourceButtons.nth(1).click();
        await page.waitForTimeout(300);
      }
      // Save
      const saveBtn = dialog.locator('button:has-text("Save")');
      await saveBtn.click();
      await page.waitForTimeout(2000);

      // Verify sources section updated
      const knowledgeCard = page.getByRole("heading", { name: "Knowledge Sources", exact: true });
      await expect(knowledgeCard).toBeVisible({ timeout: 5000 });
    }

    // Navigate away and return
    await page.goto(`${BASE}/brains`);
    await page.waitForTimeout(2000);

    const brainLink = page.locator('button:has-text("Open command center")').first();
    if (await brainLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await brainLink.click();
      await page.waitForTimeout(2000);
      const headingAfter = page.getByRole("heading", { name: "Knowledge Sources", exact: true });
      await expect(headingAfter).toBeVisible({ timeout: 5000 });
    }
  });

  test("responsive at 1024x768", async ({ page }) => {
    page.setViewportSize({ width: 1024, height: 768 });
    await loginAndCreateBrain(page);
    await expect(page).toHaveURL(/\/brains\//);

    const heading = page.getByRole("heading", { name: "Knowledge Sources", exact: true });
    await expect(heading).toBeVisible({ timeout: 5000 });

    const addBtn = page.locator('button:has-text("Add Knowledge")').first();
    await addBtn.click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    const box = await dialog.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(1024);
    }
  });

  test("responsive at 390x844 (mobile)", async ({ page }) => {
    page.setViewportSize({ width: 390, height: 844 });
    await loginAndCreateBrain(page);

    const sidebarToggle = page.locator('button[aria-label="Toggle sidebar"]');
    if (await sidebarToggle.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sidebarToggle.click();
    }

    const heading = page.getByRole("heading", { name: "Knowledge Sources", exact: true });
    await expect(heading).toBeVisible({ timeout: 5000 });

    const addBtn = page.locator('button:has-text("Add Knowledge")').first();
    await expect(addBtn).toBeVisible({ timeout: 3000 });
    await addBtn.click({ force: true });

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    const box = await dialog.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(390);
      expect(box.x).toBeGreaterThanOrEqual(0);
    }

    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  });

  test("dark mode renders correctly", async ({ page }) => {
    page.setViewportSize({ width: 1440, height: 900 });
    await loginAndCreateBrain(page);

    const themeBtn = page.locator(
      'button[aria-label*="theme"], button[aria-label*="Theme"]',
    );
    if (await themeBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await themeBtn.first().click();
      await page.waitForTimeout(1000);
    }

    const heading = page.getByRole("heading", { name: "Knowledge Sources", exact: true });
    await expect(heading).toBeVisible({ timeout: 5000 });

    const addBtn = page.locator('button:has-text("Add Knowledge")').first();
    await addBtn.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });
});
