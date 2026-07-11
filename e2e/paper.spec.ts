import { test, expect } from "@playwright/test";

test("paper route loads with title and nav back to narrative", async ({ page }) => {
  await page.goto("/paper");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /Detection Limit of Lifecycle-State Oversight/i,
  );
  await expect(page.getByRole("link", { name: /narrative/i })).toBeVisible();
});

test("paper shows the results table, the erosion figure, and the scope caveat", async ({ page }) => {
  await page.goto("/paper");
  const row = page.getByTestId("row-T1");
  await expect(row).toContainText("+1.00");
  await expect(row).toContainText("cross_stage_consistency");
  // real summary.json carries T0's static_safety attribution
  await expect(page.getByTestId("row-T0")).toContainText("static_safety");
  await expect(page.getByTestId("scope-callout")).toBeVisible();
  await expect(page.getByTestId("paper-figure").locator("svg.recharts-surface").first()).toBeVisible();
});

test("paper leaks no editorial scaffolding", async ({ page }) => {
  await page.goto("/paper");
  await expect(page.getByText(/Verify:/i)).toHaveCount(0);
  await expect(page.getByText(/IEEE-structured working draft/i)).toHaveCount(0);
});
