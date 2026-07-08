import { test, expect } from "@playwright/test";

test("narrative loads with all sections and the real F1", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "passed ≠ true" })).toBeVisible();
  await expect(page.getByTestId("section-clue")).toBeVisible();
  await expect(page.getByTestId("transfer-card")).toContainText("0.9143");
  await expect(page.getByRole("note").filter({ hasText: /train partition/i })).toBeVisible();
});

test("degradation chart renders SVG paths", async ({ page }) => {
  await page.goto("/");
  const chart = page.getByTestId("section-csl").locator("svg.recharts-surface").first();
  await expect(chart).toBeVisible();
});

test("live episode button falls back to the recorded run", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /run a live episode/i }).click();
  await expect(page.getByRole("status")).toContainText(/live unavailable — showing recorded run/i);
});
