import { expect, test } from "@playwright/test";

test("home loads with main heading and toolbar", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByTestId("add-line-item")).toBeVisible({ timeout: 60_000 });
  await expect(page.getByTestId("page-title")).toHaveCount(1);
  await expect(page.getByTestId("line-count-badge")).toBeVisible();
});

test("insert assembly and add alternate scope", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByTestId("add-alternate-section").click();
  await page.locator("#assembly-insert").selectOption("kit-drywall-room");
  await expect(page.getByTestId("line-count-badge")).toContainText(/\d+ line/);
});
