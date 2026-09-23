import { test, expect } from "playwright/test";
const baseURL = process.env.FBO_BASE_URL || "http://127.0.0.1:4173";

for (const width of [320, 768, 1024, 1440]) {
  test(`case remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${baseURL}/`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.getByText("CASE LOCAL · PRIVADO · SEM AÇÕES EXTERNAS")).toBeVisible();
    await expect(page.locator("#limitacoes")).toBeVisible();
    const sizes = await page.locator("button:visible, a:visible, select:visible").evaluateAll(nodes => nodes.map(node => ({ width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height, label: node.textContent.trim() })));
    expect(sizes.filter(size => size.height < 44 || size.width < 44)).toEqual([]);
  });
}

test("experience never requests an external origin", async ({ page }) => {
  const external = [];
  page.on("request", request => { if (!request.url().startsWith(baseURL)) external.push(request.url()); });
  await page.goto(`${baseURL}/`);
  await page.goto(`${baseURL}/design-system.html`);
  expect(external).toEqual([]);
});
