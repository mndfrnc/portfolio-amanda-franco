import { test, expect } from "playwright/test";

const baseURL = process.env.FBO_BASE_URL || "http://127.0.0.1:4173";

test("catalog exposes complete primitive and domain components", async ({ page }) => {
  await page.goto(`${baseURL}/design-system.html`);
  await expect(page.locator("[data-component]")).toHaveCount(22);
  await expect(page.getByText("DADOS SINTÉTICOS — VALIDAÇÃO LOCAL").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /enviar|importar|ativar/i })).toHaveCount(0);
});

test("accordion and tabs expose accessible state", async ({ page }) => {
  await page.goto(`${baseURL}/design-system.html`);
  const disclosure = page.getByRole("button", { name: "Ver evidência técnica" }).first();
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await disclosure.click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(2);
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
});

test("catalog tabs support roving keyboard focus", async ({ page }) => {
  await page.goto(`${baseURL}/design-system.html`);
  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect(tabs.nth(1)).toHaveAttribute("aria-controls", /.+/);
});

test("catalog examples are functional rather than name-only cards", async ({ page }) => {
  await page.goto(`${baseURL}/design-system.html`);
  await expect(page.locator("[data-component='Button'] button")).toBeVisible();
  await expect(page.locator("[data-component='Table'] table")).toBeVisible();
  await expect(page.locator("[data-component='Fit Score Card'] [data-field]")).toHaveCount(3);
  await expect(page.locator("[data-component='Source Lineage Block'] [data-field]")).toHaveCount(3);
});

test("evidence drawer traps focus, closes on Escape and returns focus", async ({ page }) => {
  await page.goto(`${baseURL}/design-system.html`);
  const trigger = page.getByRole("button", { name: "Abrir evidência" }).first();
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Fechar evidência" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
