import { test, expect } from "@playwright/test";

test("user draws, sets key, generates, sees preview", async ({ page }) => {
  await page.route("**/api/openrouter", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        choices: [{ message: { content: JSON.stringify({
          pageName: "LoginPage",
          files: [
            { path: "app/page.tsx", contents: "export default function Page(){return <div>Login</div>}", role: "page" },
          ],
        })}}],
      }),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /set key/i }).click();
  await page.getByLabel(/openrouter api key/i).fill("sk-or-mock");
  await page.getByRole("button", { name: /save/i }).click();

  const canvas = page.locator(".tl-container");
  await canvas.waitFor();
  await page.evaluate(() => {
    const ed = (window as any).__TLDRAW_EDITOR__;
    if (!ed) throw new Error("tldraw editor not exposed on window");
    ed.createShapes([{ type: "geo", x: 50, y: 50, props: { geo: "rectangle", w: 200, h: 60 } }]);
  });

  // Give the store.listen callback time to fire and update canvasShapes in context
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: /^generate$/i }).click();
  await expect(page.locator("iframe")).toBeVisible({ timeout: 30000 });
});
