import { expect, test } from "@playwright/test";

/** Guard against React hydration mismatches (random SSR/client ids) and other browser console errors. */
test("home and share emit no console errors", async ({ page }) => {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    errors.push(msg.text());
  });

  page.on("pageerror", (err) => {
    errors.push(err.message);
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.getByTestId("add-line-item")).toBeVisible({ timeout: 60_000 });

  await page.goto("/share", { waitUntil: "networkidle" });
  await expect(page.getByTestId("share-missing")).toBeVisible({ timeout: 60_000 });

  expect(errors, errors.join("\n")).toEqual([]);
});
