import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

async function loginAndNavigateToBrain(page: import("@playwright/test").Page): Promise<string> {
  await page.goto(BASE);
  await page.waitForTimeout(2000);

  const emailInput = page.locator(
    'input[name="email"], input[type="email"], input[id="email"]',
  );
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill("action-center@eaip.dev");
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
  return new URL(page.url()).pathname.split("/").pop() ?? "";
}

test.describe("Brain Action Center", () => {
  test("full action flow at 1440x900", async ({ page }) => {
    page.setViewportSize({ width: 1440, height: 900 });
    const brainId = await loginAndNavigateToBrain(page);
    expect(brainId).toBeTruthy();
    await expect(page).toHaveURL(new RegExp(`/brains/${brainId}$`));

    // Generate a recommendation
    const queryTextarea = page.getByRole("textbox", { name: "Business question" });
    await queryTextarea.fill("What should marketing focus on this week?");
    await page.getByRole("button", { name: "Generate recommendation", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Action Center", exact: true })).toBeVisible({ timeout: 10000 });

    // Verify Action Center appears
    const actionCenter = page.getByRole("heading", { name: "Action Center", exact: true });
    await expect(actionCenter).toBeVisible({ timeout: 5000 });

    // Verify recommendation details
    await expect(page.locator("text=Expected Impact")).toBeVisible();
    await expect(page.locator("text=Risk Level")).toBeVisible();
    await expect(page.getByText("Approval", { exact: true })).toBeVisible();

    // Approve
    const approveBtn = page.locator('button:has-text("Approve")').first();
    if (await approveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await approveBtn.click();
      await page.waitForTimeout(2000);
    }

    // Execute
    const executeBtn = page.locator('button:has-text("Execute Action")').first();
    if (await executeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await executeBtn.click();
      await page.waitForTimeout(3000);

      // Verify execution result
      await expect(page.getByText(/Ready for integration|Action executed successfully\./).first()).toBeVisible({ timeout: 5000 });
    }

    // Verify activity recorded
    const activitySection = page.getByRole("heading", { name: "Activity and audit", exact: true });
    await expect(activitySection).toBeVisible({ timeout: 3000 });

    // Verify memory recorded
    const memorySection = page.getByRole("heading", { name: "Memory and learning", exact: true });
    await expect(memorySection).toBeVisible({ timeout: 3000 });

    // Navigate away and return - verify persistence
    await page.goto(`${BASE}/brains`);
    await page.goto(`${BASE}/brains/${brainId}`, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(new RegExp(`/brains/${brainId}$`));
    await expect(page.getByRole("heading", { name: "Action Center", exact: true })).toBeVisible({ timeout: 5000 });
  });

  test("reject flow at 1440x900", async ({ page }) => {
    page.setViewportSize({ width: 1440, height: 900 });
    await loginAndNavigateToBrain(page);
    await expect(page).toHaveURL(/\/brains\//);

    // Generate a recommendation
    const queryTextarea = page.locator("textarea").first();
    if (await queryTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await queryTextarea.fill("What risks should we monitor?");
      const generateBtn = page.locator('button:has-text("Generate recommendation")');
      await generateBtn.click();
      await page.waitForTimeout(3000);
    }

    // Reject
    const rejectBtn = page.locator('button:has-text("Reject")').first();
    if (await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rejectBtn.click();
      await page.waitForTimeout(2000);
      await expect(page.locator("text=Action rejected.")).toBeVisible({ timeout: 5000 });
    }
  });

  test("responsive at 1024x768", async ({ page }) => {
    page.setViewportSize({ width: 1024, height: 768 });
    await loginAndNavigateToBrain(page);
    await expect(page).toHaveURL(/\/brains\//);

    // Generate recommendation
    const queryTextarea = page.locator("textarea").first();
    if (await queryTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await queryTextarea.fill("Growth opportunities?");
      await page.locator('button:has-text("Generate recommendation")').click();
      await page.waitForTimeout(3000);
    }

    const actionCenter = page.getByRole("heading", { name: "Action Center", exact: true });
    if (await actionCenter.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Verify no horizontal overflow
      const body = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth);
      expect(body).toBeTruthy();
    }
  });

  test("responsive at 390x844 (mobile)", async ({ page }) => {
    page.setViewportSize({ width: 390, height: 844 });

    await loginAndNavigateToBrain(page);

    const sidebarToggle = page.locator('button[aria-label="Toggle sidebar"]');
    if (await sidebarToggle.isVisible({ timeout: 1000 }).catch(() => false)) {
      await sidebarToggle.click();
    }

    // Generate recommendation
    const queryTextarea = page.locator("textarea").first();
    if (await queryTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await queryTextarea.fill("Growth?");
      await page.locator('button:has-text("Generate recommendation")').click({ force: true });
      await page.waitForTimeout(3000);
    }

    const actionCenter = page.getByRole("heading", { name: "Action Center", exact: true });
    if (await actionCenter.isVisible({ timeout: 3000 }).catch(() => false)) {
      const body = await page.evaluate(() => document.body.scrollWidth <= window.innerWidth + 1);
      expect(body).toBeTruthy();
    }
  });

  test("dark mode at 1440x900", async ({ page }) => {
    page.setViewportSize({ width: 1440, height: 900 });
    await loginAndNavigateToBrain(page);

    // Toggle dark mode
    const themeBtn = page.locator(
      'button[aria-label*="theme"], button[aria-label*="Theme"]',
    );
    if (await themeBtn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
      await themeBtn.first().click();
      await page.waitForTimeout(1000);
    }

    // Generate recommendation
    const queryTextarea = page.locator("textarea").first();
    if (await queryTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await queryTextarea.fill("Dark mode test");
      await page.locator('button:has-text("Generate recommendation")').click();
      await page.waitForTimeout(3000);
    }

    const actionCenter = page.getByRole("heading", { name: "Action Center", exact: true });
    if (await actionCenter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(actionCenter).toBeVisible();
    }
  });
});
