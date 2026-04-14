import { test, expect } from "@playwright/test";
import path from "path";

test("user uploads photo, generates, sees preview", async ({ page }) => {
  let call = 0;
  await page.route("**/api/openrouter", async (route) => {
    call += 1;
    const body = call === 1
      ? { choices: [{ message: { content: JSON.stringify({ shapes: [
          { type: "geo", id: "v1", x: 10, y: 10, w: 100, h: 40, props: { geo: "rectangle", text: "HEADER" } },
        ]})}}]}
      : { choices: [{ message: { content: JSON.stringify({
          pageName: "PhotoPage",
          files: [{ path: "app/page.tsx", contents: "export default function Page(){return <div>Photo</div>}", role: "page" }],
        })}}]};
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });

  await page.goto("/");
  await page.getByRole("button", { name: /set key/i }).click();
  await page.getByLabel(/openrouter api key/i).fill("sk-mock");
  await page.getByRole("button", { name: /save/i }).click();

  await page.getByRole("tab", { name: /upload photo/i }).click();
  await page.setInputFiles("input[type=file]", path.join(process.cwd(), "tests/e2e/fixtures/sample-sketch.png"));
  await page.getByRole("button", { name: /^generate$/i }).click();
  await expect(page.locator("iframe")).toBeVisible({ timeout: 20000 });
});
