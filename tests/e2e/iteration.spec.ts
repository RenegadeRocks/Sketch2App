import { test, expect } from "@playwright/test";

test("user generates then iterates with chat", async ({ page }) => {
  let call = 0;
  await page.route("**/api/openrouter", async (route) => {
    call += 1;
    const body = {
      choices: [{ message: { content: JSON.stringify({
        pageName: call === 1 ? "V1" : "V2",
        files: [{ path: "app/page.tsx", contents: `export default function Page(){return <div>V${call}</div>}`, role: "page" }],
      })}}]
    };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /set key/i }).click();
  await page.getByLabel(/openrouter api key/i).fill("sk-mock");
  await page.getByRole("button", { name: /save/i }).click();

  await page.locator(".tl-container").waitFor();
  await page.evaluate(() => {
    const ed = (window as any).__TLDRAW_EDITOR__;
    ed?.createShapes([{ type: "geo", x: 50, y: 50, props: { geo: "rectangle", w: 100, h: 40 } }]);
  });

  // Give the store.listen callback time to fire and update canvasShapes in context
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: /^generate$/i }).click();
  await expect(page.locator("iframe")).toBeVisible({ timeout: 20000 });

  await page.getByPlaceholder(/describe a change/i).fill("make it red");
  await page.keyboard.press("Control+Enter");
  await expect(page.getByText(/updated v2/i)).toBeVisible({ timeout: 20000 });
});
