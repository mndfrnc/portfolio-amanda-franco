import { test, expect } from "playwright/test";
const baseURL = process.env.FBO_BASE_URL || "http://127.0.0.1:4173";

test("case evidence drawer is keyboard safe", async ({ page }) => {
  await page.goto(`${baseURL}/#evidencias`);
  const trigger = page.getByRole("button", { name: /abrir evidência do QA/i });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Detalhe da evidência" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Fechar detalhe" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Fechar detalhe" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("filter changes are announced and skip link targets main content", async ({ page }) => {
  await page.goto(`${baseURL}/`);
  await expect(page.locator(".skip-link")).toHaveAttribute("href", "#conteudo");
  await page.locator("[data-filter-severity]").selectOption("critical");
  await expect(page.locator("[aria-live='polite']")).toContainText("0 registros visíveis");
});

test("long technical content remains reachable without page clipping", async ({ page }) => {
  await page.setViewportSize({ width:320, height:800 });
  await page.goto(`${baseURL}/`);
  await page.getByRole("button", { name:"Visão técnica" }).click();
  const code = page.locator(".code-block");
  expect(await code.evaluate(node => node.scrollWidth >= node.clientWidth)).toBe(true);
  await expect(page.locator("[data-evidence-hash]").first()).toHaveCSS("overflow-wrap", "anywhere");
});

test("reduced motion and forced colors retain explicit state text", async ({ page }) => {
  await page.emulateMedia({ reducedMotion:"reduce", forcedColors:"active" });
  await page.goto(`${baseURL}/`);
  await expect(page.getByText("CASE LOCAL · PRIVADO · SEM AÇÕES EXTERNAS")).toBeVisible();
  await expect(page.locator("#qa")).toContainText("QA-004 · aberta · baixa");
  const duration = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--duration").trim());
  expect(duration).toBe("0ms");
});
