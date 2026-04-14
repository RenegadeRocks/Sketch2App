import { test, expect } from "@playwright/test";

test("home page renders with Bauhaus background", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(240, 240, 240)");
});
