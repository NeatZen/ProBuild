import { expect, test } from "@playwright/test";

test("home loads with main heading and toolbar", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Construction estimate/i })).toBeVisible({
    timeout: 60_000,
  });
  await expect(page.getByTestId("add-line-item")).toBeVisible();
});
