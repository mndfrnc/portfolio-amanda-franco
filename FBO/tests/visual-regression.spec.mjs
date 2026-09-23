import { test, expect } from "playwright/test";
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
const baseURL = process.env.FBO_BASE_URL || "http://127.0.0.1:4173";
const output = join(process.cwd(), "Case/fbo/evidence/screenshots");
for (const [name,width,height] of [["case-desktop",1440,1000],["case-mobile",390,844],["design-system",1440,1000]]) {
  test(`captures ${name} visual evidence`, async ({ page }) => {
    await mkdir(output,{recursive:true}); await page.setViewportSize({width,height});
    await page.goto(name === "design-system" ? `${baseURL}/design-system.html` : `${baseURL}/`);
    const target=join(output,`${name}.png`); await page.screenshot({path:target,fullPage:true});
    expect((await stat(target)).size).toBeGreaterThan(40_000);
  });
}
